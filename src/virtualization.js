'use strict';

define(['module', 'knockout', 'ko-grid'], function (module, ko, koGrid) {
    var extensionId = module.id.indexOf('/') < 0 ? module.id : module.id.substring(0, module.id.indexOf('/'));

    koGrid.defineExtension(extensionId, {
        initializer: template => {
            template.before('body').insert('<tbody class="ko-grid-virtualization-before-spacer"><tr data-bind="style: { height: extensions.virtualization.__beforeHeight() + \'px\' }"><td></td></tr></tbody>');
            template.after('body').insert('<tbody class="ko-grid-virtualization-after-spacer"><tr data-bind="style: { height: extensions.virtualization.__afterHeight() + \'px\' }"><td></td></tr></tbody>');
        },
        Constructor: function VirtualizationExtension(bindingValue, config, grid) {
            var beforeHeight = ko.observable();
            var afterHeight = ko.observable();
            this['__beforeHeight'] = beforeHeight;
            this['__afterHeight'] = afterHeight;

            var scroller, beforeSpacer, afterSpacer;

            grid.postApplyBindings(() => {
                scroller = grid.element.querySelector('.ko-grid-table-scroller');
                beforeSpacer = grid.element.querySelector('.ko-grid-virtualization-before-spacer');
                afterSpacer = grid.element.querySelector('.ko-grid-virtualization-after-spacer');

                grid.data.view.filteredSize.subscribe(recomputeSpacerSizes);
                grid.layout.afterRelayout(recomputeLimit);
                scroller.addEventListener('scroll', recomputeOffset);
            });

            // TODO guesstimate a good row height
            var averageRowHeight = 25;

            function recomputeLimit() {
                var limit = Math.ceil((scroller.clientHeight - 1) / averageRowHeight) + 1;
                grid.data.limit(limit);
                recomputeSpacerSizes();
            }

            function recomputeOffset() {
                // TODO the offset should be divisible by two (for alternating row styles)
                var offset = Math.floor(grid.data.offset() + (scroller.scrollTop - beforeHeight()) / averageRowHeight);
                grid.data.offset(offset);
                recomputeSpacerSizes();
            }

            function recomputeSpacerSizes() {
                var scrolled = scroller.scrollTop;
                var remaining = Math.max(0, (grid.data.view.filteredSize() - grid.data.offset() - grid.data.limit()) * averageRowHeight);
                var viewed = scroller.clientHeight;

                var beforeBounds = beforeSpacer.getBoundingClientRect();
                var afterBounds = afterSpacer.getBoundingClientRect();
                var contentHeight = afterBounds.top - beforeBounds.bottom;

                beforeHeight(scrolled - scrolled % averageRowHeight);
                afterHeight(Math.max(0, remaining + contentHeight - viewed));
            }
        }
    });

    return koGrid.declareExtensionAlias('virtualization', extensionId);
});
