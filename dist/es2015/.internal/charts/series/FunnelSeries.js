/**
 * Defines Funnel Chart Series.
 */
import * as tslib_1 from "tslib";
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import { PercentSeries, PercentSeriesDataItem } from "./PercentSeries";
import { FunnelSlice } from "../elements/FunnelSlice";
import { FunnelTick } from "../elements/FunnelTick";
import { ListTemplate, ListDisposer } from "../../core/utils/List";
import { registry } from "../../core/Registry";
import * as $iter from "../../core/utils/Iterator";
import * as $type from "../../core/utils/Type";
import { percent } from "../../core/utils/Percent";
import { Disposer } from "../../core/utils/Disposer";
/**
 * ============================================================================
 * DATA ITEM
 * ============================================================================
 * @hidden
 */
//@todo: sequenced?
/**
 * Defines a [[DataItem]] for [[FunnelSeries]].
 *
 * @see {@link DataItem}
 */
var FunnelSeriesDataItem = /** @class */ (function (_super) {
    tslib_1.__extends(FunnelSeriesDataItem, _super);
    /**
     * Constructor
     */
    function FunnelSeriesDataItem() {
        var _this = _super.call(this) || this;
        _this.className = "FunnelSeriesDataItem";
        _this.applyTheme();
        return _this;
    }
    Object.defineProperty(FunnelSeriesDataItem.prototype, "sliceLink", {
        /**
         * A [[FunnelSlice]] element, related to this data item ([[FunnelSlice]]).
         *
         * @readonly
         * @return {FunnelSlice} Slice element
         */
        get: function () {
            var _this = this;
            if (!this._sliceLink) {
                var slice_1 = this.component.sliceLinks.create();
                this._sliceLink = slice_1;
                this._disposers.push(slice_1);
                this._disposers.push(new Disposer(function () {
                    _this.component.sliceLinks.removeValue(slice_1);
                }));
                this.addSprite(slice_1);
                slice_1.visible = this.visible;
            }
            return this._sliceLink;
        },
        enumerable: true,
        configurable: true
    });
    return FunnelSeriesDataItem;
}(PercentSeriesDataItem));
export { FunnelSeriesDataItem };
/**
 * ============================================================================
 * MAIN CLASS
 * ============================================================================
 * @hidden
 */
/**
 * Defines [[Series]] for a FunnelSlice series on a [[SlicedChart]].
 *
 * @see {@link IFunnelSeriesEvents} for a list of available Events
 * @see {@link IFunnelSeriesAdapters} for a list of available Adapters
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/sliced-chart/} for documentation
 * @important
 */
var FunnelSeries = /** @class */ (function (_super) {
    tslib_1.__extends(FunnelSeries, _super);
    /**
     * Constructor
     */
    function FunnelSeries() {
        var _this = _super.call(this) || this;
        _this._nextY = 0;
        _this.className = "FunnelSeries";
        _this.orientation = "vertical";
        _this.width = percent(100);
        _this.height = percent(100);
        _this.slicesContainer.width = percent(100);
        _this.slicesContainer.height = percent(100);
        _this.bottomRatio = 0;
        _this.applyTheme();
        return _this;
    }
    /**
     * Creates a [[FunnelSlice]] element.
     *
     * @return {FunnelSlice} Slice
     */
    FunnelSeries.prototype.createSlice = function () {
        return new FunnelSlice();
    };
    /**
     * Creates a [[FunnelTick]] element.
     *
     * @return {FunnelTick} Tick
     */
    FunnelSeries.prototype.createTick = function () {
        return new FunnelTick();
    };
    /**
     * Sets defaults that instantiate some objects that rely on parent, so they
     * cannot be set in constructor.
     */
    FunnelSeries.prototype.applyInternalDefaults = function () {
        _super.prototype.applyInternalDefaults.call(this);
        if (!$type.hasValue(this.readerTitle)) {
            this.readerTitle = this.language.translate("Funnel Series");
        }
    };
    /**
     * Returns a new/empty DataItem of the type appropriate for this object.
     *
     * @see {@link DataItem}
     * @return {FunnelSeriesDataItem} Data Item
     */
    FunnelSeries.prototype.createDataItem = function () {
        return new FunnelSeriesDataItem();
    };
    /**
     * Inits FunnelSlice.
     *
     * @param  {FunnelSlice} slice to init
     */
    FunnelSeries.prototype.initSlice = function (slice) {
        slice.isMeasured = false;
        slice.defaultState.properties.scale = 1;
        slice.observe("scale", this.handleSliceScale, this);
        slice.observe(["dx", "dy", "x", "y"], this.handleSliceMove, this);
        slice.tooltipText = "{category}: {value.percent.formatNumber('#.#')}% ({value.value})";
        var hoverState = slice.states.create("hover");
        hoverState.properties.expandDistance = 0.2;
    };
    /**
     * [initLabel description]
     *
     * @todo Description
     * @param {this["_label"]} label [description]
     */
    FunnelSeries.prototype.initLabel = function (label) {
        _super.prototype.initLabel.call(this, label);
        label.verticalCenter = "middle";
        label.horizontalCenter = "middle";
        label.isMeasured = true;
        label.padding(5, 5, 5, 5);
    };
    /**
     * (Re)validates the whole series, effectively causing it to redraw.
     *
     * @ignore Exclude from docs
     */
    FunnelSeries.prototype.validate = function () {
        _super.prototype.validate.call(this);
        this._nextY = 0;
    };
    /**
     * [validateDataElements description]
     *
     * @todo Description
     * @ignore Exclude from docs
     */
    FunnelSeries.prototype.validateDataElements = function () {
        var slicesContainer = this.slicesContainer;
        var labelsContainer = this.labelsContainer;
        var labelTemplate = this.labels.template;
        if (this.alignLabels) {
            labelTemplate.interactionsEnabled = true;
            slicesContainer.isMeasured = true;
            labelsContainer.isMeasured = true;
            labelsContainer.layout = "absolute";
            labelsContainer.margin(10, 10, 10, 10);
            this.ticks.template.disabled = false;
            labelTemplate.horizontalCenter = "left";
            if (this.orientation == "horizontal") {
                this.layout = "vertical";
                labelTemplate.rotation = -90;
            }
            else {
                this.layout = "horizontal";
                labelTemplate.rotation = 0;
            }
        }
        else {
            labelTemplate.interactionsEnabled = false;
            slicesContainer.isMeasured = false;
            labelsContainer.isMeasured = true;
            labelsContainer.layout = "absolute";
            this.ticks.template.disabled = true;
            labelTemplate.horizontalCenter = "middle";
            if (this.orientation == "horizontal") {
                labelTemplate.rotation = -90;
            }
            else {
                labelTemplate.rotation = 0;
            }
        }
        var total = 0;
        var count = 0;
        this.dataItems.each(function (dItem) {
            if ($type.hasValue(dItem.value)) {
                count++;
                total += dItem.getWorkingValue("value") / dItem.value;
            }
        });
        this._total = 1 / count * total;
        this._count = count;
        _super.prototype.validateDataElements.call(this);
        this.arrangeLabels();
    };
    /**
     * [getNextValue description]
     *
     * @todo Description
     * @param  {FunnelSeriesDataItem}  dataItem  [description]
     * @return {number}                          [description]
     */
    FunnelSeries.prototype.getNextValue = function (dataItem) {
        var index = dataItem.index;
        var nextValue = dataItem.getWorkingValue("value");
        if (index < this.dataItems.length - 1) {
            var nextItem = this.dataItems.getIndex(index + 1);
            nextValue = nextItem.getWorkingValue("value");
            if (!nextItem.visible || nextItem.isHiding) {
                return this.getNextValue(nextItem);
            }
        }
        return nextValue;
    };
    /**
     * [formDataElement description]
     *
     * @todo Description
     */
    FunnelSeries.prototype.formDataElement = function () {
    };
    /**
     * Validates data item's element, effectively redrawing it.
     *
     * @ignore Exclude from docs
     * @param {FunnelSeriesDataItem}  dataItem  Data item
     */
    FunnelSeries.prototype.validateDataElement = function (dataItem) {
        var percentValue = dataItem.values.value.percent;
        if ($type.hasValue(dataItem.value)) {
            // FunnelSlice
            var slice = dataItem.slice;
            slice.orientation = this.orientation;
            slice.parent = this.slicesContainer;
            var sliceLink = dataItem.sliceLink;
            sliceLink.parent = this.slicesContainer;
            sliceLink.orientation = this.orientation;
            var tick = dataItem.tick;
            tick.parent = this.ticksContainer;
            var label = dataItem.label;
            label.parent = this.labelsContainer;
            tick.slice = slice;
            tick.label = label;
            this.decorateSlice(dataItem);
            sliceLink.fill = slice.fill;
            if (dataItem.index == this.dataItems.length - 1) {
                sliceLink.disabled = true;
            }
            // do this at the end, otherwise bullets won't be positioned properly
            _super.prototype.validateDataElement.call(this, dataItem);
        }
    };
    /**
     * [decorateSlice description]
     *
     * @todo Description
     * @param {this["_dataItem"]} dataItem [description]
     */
    FunnelSeries.prototype.decorateSlice = function (dataItem) {
        var slice = dataItem.slice;
        var sliceLink = dataItem.sliceLink;
        var label = dataItem.label;
        var tick = dataItem.tick;
        var maxWidth = this.slicesContainer.innerWidth;
        var maxHeight = this.slicesContainer.innerHeight;
        var nextValue = this.getNextValue(dataItem);
        var workingValue = dataItem.getWorkingValue("value");
        var bottomRatio = this.bottomRatio;
        if (this.orientation == "vertical") {
            var linkHeight = sliceLink.pixelHeight;
            maxHeight = maxHeight + linkHeight; // to avoid one link gap in the bottom
            slice.topWidth = workingValue / this.dataItem.values.value.high * maxWidth;
            slice.bottomWidth = (workingValue - (workingValue - nextValue) * bottomRatio) / this.dataItem.values.value.high * maxWidth;
            sliceLink.topWidth = slice.bottomWidth;
            sliceLink.bottomWidth = (workingValue - (workingValue - nextValue)) / this.dataItem.values.value.high * maxWidth;
            slice.y = this._nextY;
            slice.height = maxHeight / this._count * workingValue / dataItem.value * 1 / this._total - linkHeight;
            slice.x = maxWidth / 2;
            label.x = slice.x;
            label.y = slice.pixelY + slice.pixelHeight * tick.locationY;
            this._nextY += slice.pixelHeight + linkHeight;
            sliceLink.y = this._nextY - linkHeight;
            sliceLink.x = slice.x;
        }
        else {
            var linkWidth = sliceLink.pixelWidth;
            maxWidth = maxWidth + linkWidth; // to avoid one link gap in the bottom
            slice.topWidth = workingValue / this.dataItem.values.value.high * maxHeight;
            slice.bottomWidth = (workingValue - (workingValue - nextValue) * bottomRatio) / this.dataItem.values.value.high * maxHeight;
            sliceLink.topWidth = slice.bottomWidth;
            sliceLink.bottomWidth = (workingValue - (workingValue - nextValue)) / this.dataItem.values.value.high * maxHeight;
            slice.x = this._nextY;
            slice.width = maxWidth / this._count * workingValue / dataItem.value * 1 / this._total - linkWidth;
            slice.y = maxHeight / 2;
            label.y = slice.y;
            label.x = slice.pixelX + slice.pixelWidth * tick.locationX;
            this._nextY += slice.pixelWidth + linkWidth;
            sliceLink.x = this._nextY - linkWidth;
            sliceLink.y = slice.y;
        }
    };
    /**
     * [arrangeLabels description]
     *
     * @todo Description
     */
    FunnelSeries.prototype.arrangeLabels = function () {
        if (this.alignLabels) {
            var count = this.labels.length;
            var lastLabel = this.labels.getIndex(count - 1);
            var lastY = lastLabel.pixelY;
            var lastX = lastLabel.pixelX;
            if (this.labels.length > 1) {
                for (var i = count - 2; i >= 0; i--) {
                    var label = this.labels.getIndex(i);
                    if (label.visible) {
                        if (label.invalid) {
                            label.validate();
                        }
                        if (this.orientation == "vertical") {
                            if (label.pixelY + label.measuredHeight > lastY) {
                                label.y = lastY - label.measuredHeight;
                            }
                        }
                        else {
                            if (label.pixelX + label.measuredWidth > lastX) {
                                label.x = lastX - label.measuredWidth;
                            }
                        }
                        lastY = label.pixelY;
                        lastX = label.pixelX;
                    }
                }
                lastY = 0;
                lastX = 0;
                for (var i = 0; i < count; i++) {
                    var label = this.labels.getIndex(i);
                    if (label.visible) {
                        if (label.invalid) {
                            label.validate();
                        }
                        if (this.orientation == "vertical") {
                            if (label.pixelY < lastY) {
                                label.y = lastY;
                            }
                        }
                        else {
                            if (label.pixelX < lastX) {
                                label.x = lastX;
                            }
                        }
                        lastY += label.measuredHeight;
                        lastX += label.measuredWidth;
                    }
                }
            }
        }
    };
    /**
     * Positions series bullet.
     *
     * @ignore Exclude from docs
     * @param {Bullet}  bullet  Bullet
     */
    FunnelSeries.prototype.positionBullet = function (bullet) {
        _super.prototype.positionBullet.call(this, bullet);
        var dataItem = bullet.dataItem;
        var slice = dataItem.slice;
        var locationX = bullet.locationX;
        if (!$type.isNumber(locationX)) {
            locationX = 0.5;
        }
        var locationY = bullet.locationY;
        if (!$type.isNumber(locationY)) {
            locationY = 1;
        }
        bullet.x = slice.measuredWidth * locationX;
        bullet.y = slice.measuredHeight * locationY;
    };
    Object.defineProperty(FunnelSeries.prototype, "orientation", {
        /**
         * @return {Orientation} Orientation
         */
        get: function () {
            return this.getPropertyValue("orientation");
        },
        /**
         * Orientation of the funnel slices: "horizontal" or "vertical" (default).
         *
         * @default "vertical"
         * @param {Orientation} value Orientation
         */
        set: function (value) {
            if (this.setPropertyValue("orientation", value)) {
                this.invalidateDataRange();
                if (value == "vertical") {
                    this.ticks.template.locationX = 1;
                    this.ticks.template.locationY = 0.5;
                }
                else {
                    this.ticks.template.locationX = 0.5;
                    this.ticks.template.locationY = 1;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FunnelSeries.prototype, "bottomRatio", {
        /**
         * @return {number}
         */
        get: function () {
            return this.getPropertyValue("bottomRatio");
        },
        /**
         * Indicates how slice's bottom will change in relation to slices top AND
         * next slices top.
         *
         * Basically it's a relative value (0-1) that indicates bottom width
         * position between current slice's top width and the top withd of the next
         * one.
         *
         * The scale goes from 0 (closer to current slice width) to 1 (closer to next
         * slice with).
         *
         * `0` (default) will mean that bottom will be the same as top, resulting in
         * a prefectly square slice.
         *
         * From the data-viz standpoint `0` is a correct setting, since area of the
         * slices will depict their value correctly.
         *
         * `1` will mean that slice will become trapezoid with its bottom matching
         * width of the next slice.
         *
         * `0.5` will make bottom width be in the middle of width of current slice
         * and the next slice.
         *
         * @default 0
         * @param {number}
         */
        set: function (value) {
            if (this.setPropertyValue("bottomRatio", value)) {
                this.invalidateDataRange();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FunnelSeries.prototype, "sliceLinks", {
        /**
         * A list of elements linking each actual slice.
         *
         * Please note that links are [[FunnelSlice]] objects, just like real links,
         * so they have all the same configuration options.
         *
         * You can use `template` of this link, to specify how links will look.
         *
         * ```TypeScript
         * series.sliceLinks.template.fillOpacity = 0.5;
         * ```
         * ```JavaScript
         * series.sliceLinks.template.fillOpacity = 0.5;
         * ```
         * ```JSON
         * {
         *   // ...
         *   "series": [{
         *     "type": "FunnelSeries",
         *      // ...
         *      "sliceLinks": {
         *        "fillOpacity": 0.5
         *      }
         *   }]
         * }
         * ```
         *
         * @return {ListTemplate} Funnel links
         */
        get: function () {
            if (!this._sliceLinks) {
                var sliceLink = new FunnelSlice();
                sliceLink.applyOnClones = true;
                sliceLink.fillOpacity = 0.5;
                sliceLink.expandDistance = -0.3;
                this._disposers.push(sliceLink);
                this._sliceLinks = new ListTemplate(sliceLink);
                this._disposers.push(new ListDisposer(this._sliceLinks));
            }
            return this._sliceLinks;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Shows hidden series.
     *
     * @param  {number}     duration  Duration of reveal animation (ms)
     * @return {Animation}            Animation
     */
    FunnelSeries.prototype.show = function (duration) {
        var _this = this;
        var animation = _super.prototype.show.call(this, duration);
        var startIndex = this.startIndex;
        var endIndex = this.endIndex;
        $iter.each($iter.indexed(this.dataItems.iterator()), function (a) {
            var interpolationDuration = _this.interpolationDuration;
            if ($type.isNumber(duration)) {
                interpolationDuration = duration;
            }
            var i = a[0];
            var dataItem = a[1];
            var delay = 0;
            if (_this.sequencedInterpolation) {
                delay = _this.sequencedInterpolationDelay * i + interpolationDuration * (i - startIndex) / (endIndex - startIndex);
            }
            animation = dataItem.show(interpolationDuration, delay, ["value"]);
        });
        return animation;
    };
    /**
     * Hides series.
     *
     * @param  {number}     duration  Duration of hiding animation (ms)
     * @return {Animation}            Animation
     */
    FunnelSeries.prototype.hide = function (duration) {
        var _this = this;
        var animation = _super.prototype.hide.call(this, duration);
        var fields = ["value"];
        var value = 0;
        var startIndex = this.startIndex;
        var endIndex = this.endIndex;
        $iter.each($iter.indexed(this.dataItems.iterator()), function (a) {
            var i = a[0];
            var dataItem = a[1];
            var delay = 0;
            var interpolationDuration = _this.interpolationDuration;
            if ($type.isNumber(duration)) {
                interpolationDuration = duration;
            }
            if (animation && !animation.isDisposed() && interpolationDuration == 0 && animation.duration > 0) {
                animation.events.once("animationended", function () {
                    dataItem.hide(0, 0, value, fields);
                });
            }
            else {
                if (_this.sequencedInterpolation) {
                    delay = _this.sequencedInterpolationDelay * i + interpolationDuration * (i - startIndex) / (endIndex - startIndex);
                }
                dataItem.hide(interpolationDuration, delay, value, fields);
            }
        });
        //}
        return animation;
    };
    return FunnelSeries;
}(PercentSeries));
export { FunnelSeries };
/**
 * bboxter class in system, so that it can be instantiated using its name from
 * anywhere.
 *
 * @ignore
 */
registry.registeredClasses["FunnelSeries"] = FunnelSeries;
registry.registeredClasses["FunnelSeriesDataItem"] = FunnelSeriesDataItem;
//# sourceMappingURL=FunnelSeries.js.map