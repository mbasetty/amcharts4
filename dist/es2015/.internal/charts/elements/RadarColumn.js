/**
 * Module that defines everything related to building RadarColumns.
 * It is a container which has radarColumn element which is a Slice.
 */
import * as tslib_1 from "tslib";
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import { Column } from "./Column";
import { Slice } from "../../core/elements/Slice";
import { registry } from "../../core/Registry";
import * as $type from "../../core/utils/Type";
/**
 * ============================================================================
 * MAIN CLASS
 * ============================================================================
 * @hidden
 */
/**
 * Class used to creates RadarColumns.
 *
 * @see {@link IRadarColumnEvents} for a list of available events
 * @see {@link IRadarColumnAdapters} for a list of available Adapters
 * @todo Usage example
 * @important
 */
var RadarColumn = /** @class */ (function (_super) {
    tslib_1.__extends(RadarColumn, _super);
    /**
     * Constructor
     */
    function RadarColumn() {
        var _this = _super.call(this) || this;
        _this.className = "RadarColumn";
        return _this;
    }
    RadarColumn.prototype.createAssets = function () {
        this.radarColumn = this.createChild(Slice);
        this.radarColumn.shouldClone = false;
        this.radarColumn.strokeOpacity = undefined;
        // some dirty hack so that if user access column, it won't get error
        this.column = this.radarColumn;
    };
    RadarColumn.prototype.copyFrom = function (source) {
        _super.prototype.copyFrom.call(this, source);
        if (this.radarColumn) {
            this.radarColumn.copyFrom(source.radarColumn);
        }
    };
    /**
     * X coordinate for the slice tooltip.
     *
     * @return {number} X
     */
    RadarColumn.prototype.getTooltipX = function () {
        var value = this.getPropertyValue("tooltipX");
        if (!$type.isNumber(value)) {
            value = this.radarColumn.tooltipX;
        }
        return value;
    };
    /**
     * Y coordinate for the slice tooltip.
     *
     * @return {number} Y
     */
    RadarColumn.prototype.getTooltipY = function () {
        var value = this.getPropertyValue("tooltipX");
        if (!$type.isNumber(value)) {
            value = this.radarColumn.tooltipY;
        }
        return value;
    };
    return RadarColumn;
}(Column));
export { RadarColumn };
/**
 * Register class in system, so that it can be instantiated using its name from
 * anywhere.
 *
 * @ignore
 */
registry.registeredClasses["RadarColumn"] = RadarColumn;
//# sourceMappingURL=RadarColumn.js.map