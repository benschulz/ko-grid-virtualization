'use strict';

define(['module', 'knockout', 'ko-grid'], function (module, ko, koGrid) {
    var extensionId = module.id.indexOf('/') < 0 ? module.id : module.id.substring(0, module.id.indexOf('/'));

    koGrid.defineExtension(extensionId, {
        initializer: template => {
            template.before('body').insert('<tbody class="ko-grid-virtualization-before-spacer"><tr data-bind="style: { height: extensions.virtualization.__beforeHeight() + \'px\' }"><td></td></tr></tbody>');
            template.after('body').insert('<tbody class="ko-grid-virtualization-after-spacer"><tr data-bind="style: { height: extensions.virtualization.__afterHeight() + \'px\' }"><td></td></tr></tbody>');
        },
        Constructor: function VirtualizationExtension(bindingValue, config, grid) {
            var beforeHeight = ko.observable(0);
            var afterHeight = ko.observable(0);
            this['__beforeHeight'] = beforeHeight;
            this['__afterHeight'] = afterHeight;

            var scroller, beforeSpacer, afterSpacer;

            grid.postApplyBindings(() => {
                scroller = grid.element.querySelector('.ko-grid-table-scroller');
                beforeSpacer = grid.element.querySelector('.ko-grid-virtualization-before-spacer');
                afterSpacer = grid.element.querySelector('.ko-grid-virtualization-after-spacer');

                grid.layout.afterRelayout(recomputeLimit);
                grid.data.view.filteredSize.subscribe(recomputeAfterSpacerSizes);
                scroller.addEventListener('scroll', recomputeOffset);
            });

            // TODO guesstimate a good row height
            var averageRowHeight = 25;

            function recomputeLimit() {
                var limit = Math.ceil((scroller.clientHeight - 1) / averageRowHeight) + 2;
                grid.data.limit(limit);
            }

            function recomputeOffset() {
                var scrollTop = scroller.scrollTop;
                var pixelDelta = scroller.getBoundingClientRect().top - beforeSpacer.getBoundingClientRect().bottom;
                var rowDelta = Math.floor(pixelDelta / averageRowHeight);
                var offset = Math.max(0, Math.min(grid.data.view.filteredSize() - grid.data.view.size() + 2, grid.data.offset() + rowDelta));
                var offsetModulo = offset & 1;
                offset -= offsetModulo;

                grid.data.offset(offset);
                beforeHeight(scrollTop - offsetModulo * averageRowHeight - scrollTop % averageRowHeight);
                recomputeAfterSpacerSizes();
            }

            function recomputeAfterSpacerSizes() {
                afterHeight(Math.max(0, grid.data.view.filteredSize() - grid.data.offset() - grid.data.limit()) * averageRowHeight);
            }
        }
    });

    return koGrid.declareExtensionAlias('virtualization', extensionId);
});
