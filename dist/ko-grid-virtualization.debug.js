/**
 * @license Copyright (c) 2015, Ben Schulz
 * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
 */
;(function(factory) {
    if (typeof define === 'function' && define['amd'])
        define(['ko-grid', 'knockout', 'ko-data-source', 'ko-indexed-repeat'], factory);
    else
        window['ko-grid-virtualization'] = factory(window.ko.bindingHandlers['grid'], window.ko);
} (function(ko_grid, knockout) {
var ko_grid_virtualization_virtualization, ko_grid_virtualization;

ko_grid_virtualization_virtualization = function (module, ko, koGrid) {
  var extensionId = 'ko-grid-virtualization'.indexOf('/') < 0 ? 'ko-grid-virtualization' : 'ko-grid-virtualization'.substring(0, 'ko-grid-virtualization'.indexOf('/'));
  koGrid.defineExtension(extensionId, {
    initializer: function (template) {
      template.before('body').insert('<tbody class="ko-grid-virtualization-before-spacer"><tr data-bind="style: { height: extensions.virtualization.__beforeHeight() + \'px\' }"><td></td></tr></tbody>');
      template.after('body').insert('<tbody class="ko-grid-virtualization-after-spacer"><tr data-bind="style: { height: extensions.virtualization.__afterHeight() + \'px\' }"><td></td></tr></tbody>');
    },
    Constructor: function VirtualizationExtension(bindingValue, config, grid) {
      var beforeHeight = ko.observable(0);
      var afterHeight = ko.observable(0);
      this['__beforeHeight'] = beforeHeight;
      this['__afterHeight'] = afterHeight;
      var scroller, beforeSpacer, afterSpacer;
      grid.postApplyBindings(function () {
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
}({}, knockout, ko_grid);
ko_grid_virtualization = function (main) {
  return main;
}(ko_grid_virtualization_virtualization);return ko_grid_virtualization;
}));