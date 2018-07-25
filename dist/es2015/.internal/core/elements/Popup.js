/**
 * Popup class is used to display information over chart area.
 */
import * as tslib_1 from "tslib";
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import popupCSS from "./PopupCSS";
import { Adapter } from "../utils/Adapter";
import { BaseObject } from "../Base";
import { getInteraction } from "../interaction/Interaction";
import { keyboard } from "../utils/Keyboard";
import { MultiDisposer } from "../utils/Disposer";
import * as $type from "../utils/Type";
import * as $object from "../utils/Object";
/**
 * Shows an HTML popup which covers window or a chart area.
 *
 * @todo Positioning over whole window
 */
var Popup = /** @class */ (function (_super) {
    tslib_1.__extends(Popup, _super);
    /**
     * Constructor
     */
    function Popup() {
        var _this = _super.call(this) || this;
        /**
         * Adapter.
         *
         * @type {Adapter<Popup, IPopupAdapters>}
         */
        _this.adapter = new Adapter(_this);
        /**
         * Holds references to various HTML elements, Popup consists of.
         */
        _this._elements = {};
        /**
         * Holdes Interaction objects for various Popup's elements.
         */
        _this._IOs = {};
        /**
         * Contents of popup window.
         *
         * @type {string}
         */
        _this._content = "";
        /**
         * Title of the popup window.
         *
         * @type {string}
         */
        _this._title = "";
        /**
         * Prefix to apply to class names for popup elements.
         *
         * @type {string}
         */
        _this._classPrefix = "ampopup";
        /**
         * If set to `true` [[Popup]] will use default styles.
         *
         * @type {boolean}
         */
        _this._defaultStyles = true;
        /**
         * If set to `true` [[Popup]] will dim out all chart content behind it by
         * showing a semi-transparent fill. (curtain)
         *
         * @type {boolean}
         */
        _this._showCurtain = false;
        /**
         * Indicates whether popup can be dragged.
         *
         * @type {boolean}
         */
        _this._draggable = true;
        /**
         * Horizontal position of the content window.
         *
         * @type {Align}
         */
        _this._align = "center";
        /**
         * Vertical position of the content window.
         *
         * @type {VerticalAlign}
         */
        _this._verticalAlign = "middle";
        /**
         * Shift in position of the element. (used for dragging)
         *
         * @type {number}
         */
        _this._shift = {
            x: 0,
            y: 0
        };
        /**
         * Temporary shift in position of the element. (used for dragging)
         *
         * @type {number}
         */
        _this._tempShift = {
            x: 0,
            y: 0
        };
        /**
         * A title for screen readers. It is very highly recommended to set that title
         * so that people using screen reader tools can get an immediate summary of
         * the information in the popup.
         *
         * @type {string}
         */
        _this.readerTitle = "";
        /**
         * Is popup closable?
         *
         * @type {boolean}
         */
        _this._closable = true;
        /**
         * Was CSS already loaded?
         *
         * @type {boolean}
         */
        _this._cssLoaded = false;
        /**
         * If set to other than "none" will try to re-adjust the position of the
         * popop to fit within chart container or browser window.
         *
         * @ignore Feature not yet implemented
         * @todo Implement
         * @type {"none" | "container" | "window"}
         */
        _this._fitTo = "window";
        /**
         * Identifies if this object is a "template" and should not be treated as
         * real object that is drawn or actually used in the chart.
         *
         * @ignore Exclude from docs
         * @type {boolean}
         */
        _this.isTemplate = false;
        /**
         * Indicates if the element was already sized and should not be measured for
         * sized again, saving some precious resources.
         *
         * @type {boolean}
         */
        _this._sized = false;
        _this.className = "Popup";
        return _this;
    }
    /**
     * Shows popup window.
     */
    Popup.prototype.open = function () {
        if (this.container) {
            if (this._elements.wrapper) {
                this.container.appendChild(this._elements.wrapper);
            }
            if (this._elements.curtain) {
                this.container.appendChild(this._elements.curtain);
                this.showCurtain = this.showCurtain;
            }
            this.positionElement();
        }
    };
    /**
     * Hides popup window.
     */
    Popup.prototype.close = function () {
        if (this._elements.wrapper) {
            if (this._elements.wrapper.parentElement) {
                this._elements.wrapper.parentElement.removeChild(this._elements.wrapper);
            }
        }
        if (this._elements.curtain) {
            if (this._elements.curtain.parentElement) {
                this._elements.curtain.parentElement.removeChild(this._elements.curtain);
            }
        }
        this._releasePointers();
    };
    /**
     * Destroy (dispose) popup.
     */
    Popup.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.close();
    };
    /**
     * Positions content element in the center of popup based on its actual size.
     *
     * @ignore Exclude from docs
     */
    Popup.prototype.positionElement = function (forceResize) {
        var _this = this;
        if (forceResize === void 0) { forceResize = true; }
        if (!this._elements.wrapper) {
            return;
        }
        setTimeout(function () {
            if (forceResize || !_this._sized) {
                _this._elements.wrapper.style.opacity = "0.01";
                _this._elements.wrapper.style.left = "0";
                _this._elements.wrapper.style.top = "0";
                // Size the element, but only for the first time
                if (!_this._elements.wrapper.style.width) {
                    var bbox = _this._elements.wrapper.getBoundingClientRect();
                    _this._elements.wrapper.style.width = bbox.width + "px";
                    _this._elements.wrapper.style.height = bbox.height + "px";
                }
                _this._sized = true;
            }
            setTimeout(function () {
                var bbox;
                if ((forceResize || !_this._sized) && _this._bbox) {
                    bbox = _this._bbox;
                }
                else {
                    bbox = _this._elements.wrapper.getBoundingClientRect();
                    _this._elements.wrapper.style.opacity = "";
                }
                // Set horizontal positioning
                switch (_this.align) {
                    case "left":
                        _this._elements.wrapper.style.left = "0";
                        _this._elements.wrapper.style.right = "auto";
                        _this._elements.wrapper.style.marginLeft = _this.toStyle(_this._shift.x + _this._tempShift.x);
                        break;
                    case "center":
                        _this._elements.wrapper.style.left = "50%";
                        _this._elements.wrapper.style.right = "auto";
                        _this._elements.wrapper.style.marginLeft = _this.toStyle(Math.round(-bbox.width / 2) + (_this._shift.x + _this._tempShift.x));
                        break;
                    case "right":
                        _this._elements.wrapper.style.left = "auto";
                        _this._elements.wrapper.style.right = "0";
                        _this._elements.wrapper.style.marginLeft = _this.toStyle(_this._shift.x + _this._tempShift.x);
                        break;
                    default:
                        _this._elements.wrapper.style.left = _this.toStyle(_this.left) || "auto";
                        _this._elements.wrapper.style.right = _this.toStyle(_this.right) || "auto";
                        _this._elements.wrapper.style.marginLeft = _this.toStyle(_this._shift.x + _this._tempShift.x);
                        break;
                }
                // Set vertical positioning
                switch (_this.verticalAlign) {
                    case "top":
                        _this._elements.wrapper.style.top = "0";
                        _this._elements.wrapper.style.bottom = "auto";
                        _this._elements.wrapper.style.marginTop = _this.toStyle(_this._shift.y + _this._tempShift.y);
                        break;
                    case "middle":
                        _this._elements.wrapper.style.top = "50%";
                        _this._elements.wrapper.style.bottom = "auto";
                        _this._elements.wrapper.style.marginTop = _this.toStyle(Math.round(-bbox.height / 2) + (_this._shift.y + _this._tempShift.y));
                        break;
                    case "bottom":
                        _this._elements.wrapper.style.top = "auto";
                        _this._elements.wrapper.style.bottom = "0";
                        _this._elements.wrapper.style.marginTop = _this.toStyle(_this._shift.y + _this._tempShift.y);
                        break;
                    default:
                        _this._elements.wrapper.style.top = _this.toStyle(_this.top) || "auto";
                        _this._elements.wrapper.style.bottom = _this.toStyle(_this.bottom) || "auto";
                        _this._elements.wrapper.style.marginTop = _this.toStyle(_this._shift.y + _this._tempShift.y);
                        break;
                }
            }, 1);
        }, 1);
    };
    Popup.prototype.setupDragging = function () {
        var _this = this;
        if (this.draggable) {
            if (!this._IOs.wrapper.events.has("drag")) {
                this._IOs.wrapper.events.on("drag", function (ev) {
                    _this._tempShift.x = ev.shift.x;
                    _this._tempShift.y = ev.shift.y;
                    _this.positionElement(false);
                });
            }
            if (!this._IOs.wrapper.events.has("dragstop")) {
                this._IOs.wrapper.events.on("dragstop", function (ev) {
                    _this._shift.x += _this._tempShift.x;
                    _this._shift.y += _this._tempShift.y;
                    _this._tempShift.x = 0;
                    _this._tempShift.y = 0;
                    _this.positionElement(false);
                });
            }
        }
        else {
            // @todo Remove events
        }
    };
    Popup.prototype.toStyle = function (value) {
        if (!$type.hasValue(value)) {
            return null;
        }
        else if ($type.isNumber(value)) {
            return "" + value + "px";
        }
        else {
            return value.toString();
        }
    };
    Object.defineProperty(Popup.prototype, "classPrefix", {
        /**
         * A prefix that is applied to class names of various popup elements.
         *
         * @return {string} Class name prefix
         */
        get: function () {
            return this.adapter.apply("classPrefix", this._classPrefix);
        },
        /**
         * @param {string} value Class name prefix
         */
        set: function (value) {
            this._classPrefix = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "classPrefixRaw", {
        /**
         * Returns raw prefix (without adapters applied).
         *
         * @ignore Exclude from docs
         * @return {string} Class name prefix
         */
        get: function () {
            return this._classPrefix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "content", {
        /**
         * @return {string} Popup content
         */
        get: function () {
            return this.adapter.apply("content", this._content);
        },
        /**
         * Popup content.
         *
         * Popup content can be any valid HTML, including CSS.
         *
         * @param {string} value Popup content
         */
        set: function (value) {
            if (this._content != value) {
                this._content = value;
                if (!this._elements.content) {
                    this.createContentElement();
                }
                this._elements.content.innerHTML = value;
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Popup.prototype.getClassNames = function () {
        return this.adapter.apply("classNames", {
            wrapperClass: this.classPrefix + "",
            titleClass: this.classPrefix + "-title",
            contentClass: this.classPrefix + "-content",
            curtainClass: this.classPrefix + "-curtain",
            closeClass: this.classPrefix + "-close"
        });
    };
    /**
     * Creates content element.
     */
    Popup.prototype.createContentElement = function () {
        // Check if it's created already
        if (this._elements.wrapper) {
            return;
        }
        // Get class names for popup elements
        var classNames = this.getClassNames();
        // Create content element
        var wrapper = document.createElement("div");
        wrapper.className = classNames.contentClass;
        wrapper.style.opacity = "0.01";
        // Create close button
        var close = document.createElement("a");
        close.className = classNames.closeClass;
        // Content title
        var title = document.createElement("div");
        title.innerHTML = this.title;
        title.className = classNames.titleClass;
        if (!this.title) {
            title.style.display = "none";
        }
        // Content div
        var content = document.createElement("div");
        content.innerHTML = this.content;
        // Set up events for content
        this._IOs.wrapper = getInteraction().getInteraction(wrapper);
        this._disposers.push(this._IOs.wrapper);
        // Set hover/out events
        this._IOs.wrapper.events.on("over", this._disablePointers, this);
        this._IOs.wrapper.events.on("out", this._releasePointers, this);
        // Create an InteractionObject for close
        this._IOs.close = getInteraction().getInteraction(close);
        this._disposers.push(this._IOs.close);
        // Hide close for now
        close.style.visibility = "hidden";
        // Add accessible stuff
        wrapper.setAttribute("role", "dialog");
        wrapper.setAttribute("aria-label", this.adapter.apply("readerTitle", this.readerTitle));
        // Add to wrapper
        wrapper.appendChild(close);
        wrapper.appendChild(title);
        wrapper.appendChild(content);
        this.container.appendChild(wrapper);
        // Save for later access
        this._elements.wrapper = wrapper;
        this._elements.content = content;
        this._elements.title = title;
        this._elements.close = close;
        // Load CSS
        if (this.defaultStyles) {
            this.loadDefaultCSS();
        }
        // Create curtain as well
        this.createCurtainElement();
        // Apply events
        this._applyEvents();
        // Draggable?
        this.setupDragging();
    };
    Object.defineProperty(Popup.prototype, "title", {
        /**
         * @return {string} Popup content
         */
        get: function () {
            return this.adapter.apply("title", this._title);
        },
        /**
         * Popup ttile.
         *
         * Popup title can be any valid HTML, including CSS.
         * @param {string} value Popup content
         */
        set: function (value) {
            if (this._title != value) {
                this._title = value;
                if (!this._elements.content) {
                    this.createContentElement();
                }
                this._elements.title.innerHTML = value;
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "closable", {
        /**
         * @return {boolean} Closable?
         */
        get: function () {
            return this.adapter.apply("closable", this._closable);
        },
        /**
         * Is popup closable?
         *
         * If it is, it can be closed in a number of ways, e.g. by hitting ESC key,
         * clicking curtain, or clicking the close button.
         *
         * If it is not closable, the only way to close it is via `close()` call.
         *
         * @param {boolean} value Closable?
         */
        set: function (value) {
            if (value !== this._closable) {
                this._closable = value;
                this._applyEvents();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "fitTo", {
        /**
         * @ignore
         * @todo Implement
         * @return {"none" | "container" | "window"} Fit option
         */
        get: function () {
            return this.adapter.apply("fitTo", this._fitTo);
        },
        /**
         * If set to other than "none" will try to re-adjust the position of the
         * popop to fit within chart container or browser window.
         *
         * @ignore
         * @todo Implement
         * @default "window"
         * @param {"none" | "container" | "window"}  value  Fit option
         */
        set: function (value) {
            if (value != this._fitTo) {
                this._fitTo = value;
                this.positionElement;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "defaultStyles", {
        /**
         * @return {boolean} Use default CSS?
         */
        get: function () {
            return this.adapter.apply("defaultStyles", this._defaultStyles);
        },
        /**
         * Should popup use default CSS?
         *
         * If default CSS is disabled, an external CSS should handle the look of the
         * popup, since it will look quite out of place otherwise.
         *
         * @default true
         * @param {string} Use default CSS?
         */
        set: function (value) {
            if (this._defaultStyles != value) {
                this._defaultStyles = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "showCurtain", {
        /**
         * @return {boolean} Show curtain?
         */
        get: function () {
            return this.adapter.apply("showCurtain", this._showCurtain);
        },
        /**
         * Should popup use dim out all content behind it?
         *
         * @default false
         * @param {boolean} Show curtain?
         */
        set: function (value) {
            if (this._showCurtain != value) {
                this._showCurtain = value;
                if (this._elements.curtain) {
                    this._elements.curtain.style.display = value ? "block" : "none";
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates curtain element.
     */
    Popup.prototype.createCurtainElement = function () {
        // Get class names for popup elements
        var classNames = this.getClassNames();
        // Create the curtain
        var curtain = document.createElement("div");
        curtain.className = classNames.curtainClass;
        // Append curtain to wrapper
        this.container.appendChild(curtain);
        // Create an InteractionObject for curtain because we might need to
        // set interactions on it
        this._IOs.curtain = getInteraction().getInteraction(curtain);
        // Add Curtain IO to disposers
        this._disposers.push(this._IOs.curtain);
        // Set events to disable underlying interactivity
        this._IOs.curtain.events.on("over", this._disablePointers, this);
        this._IOs.curtain.events.on("out", this._releasePointers, this);
        // Hide it?
        curtain.style.display = this.showCurtain ? "block" : "none";
        // Save for later
        this._elements.curtain = curtain;
    };
    Object.defineProperty(Popup.prototype, "draggable", {
        /**
         * @return {boolean} Show curtain?
         */
        get: function () {
            return this.adapter.apply("draggable", this._draggable);
        },
        /**
         * Can the popup be dragged with a pointer?
         *
         * @default false
         * @param {boolean} Show curtain?
         */
        set: function (value) {
            if (this._draggable != value) {
                this._draggable = value;
                this.setupDragging();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "align", {
        /**
         * @return {boolean} Horizontal position
         */
        get: function () {
            return this.adapter.apply("align", this._align);
        },
        /**
         * Horizontal positioning of the content window.
         *
         * Available options: "left", "center" (default), "right", and "none".
         *
         * @default "center"
         * @param {Align} Horizontal position
         */
        set: function (value) {
            if (this._align != value) {
                this._align = value;
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "verticalAlign", {
        /**
         * @return {boolean} Vertical position
         */
        get: function () {
            return this.adapter.apply("verticalAlign", this._verticalAlign);
        },
        /**
         * Vertical positioning of the content window.
         *
         * Available options: "top", "middle" (default), "bottom", and "none".
         *
         * @default "middle"
         * @param {VerticalAlign} Vertical position
         */
        set: function (value) {
            if (this._verticalAlign != value) {
                this._verticalAlign = value;
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "left", {
        /**
         * @return {boolean} Left
         */
        get: function () {
            return this.adapter.apply("left", this._left);
        },
        /**
         * "left" coordinate of a non-aligned (`align = "none"`) popup.
         *
         * Can be either absolute pixel value, or relative (`Percent`).
         *
         * Setting this property will automatically set `align` to "none".
         *
         * NOTE: The position is relative to the chart container.
         *
         * @param {number | Percent} Left
         */
        set: function (value) {
            if (this.left != value) {
                this._left = value;
                this._align = "none";
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "right", {
        /**
         * @return {boolean} Right
         */
        get: function () {
            return this.adapter.apply("right", this._right);
        },
        /**
         * "right" coordinate of a non-aligned (`align = "none"`) popup.
         *
         * Can be either absolute pixel value, or relative (`Percent`).
         *
         * Setting this property will automatically set `align` to "none".
         *
         * NOTE: The position is relative to the chart container.
         *
         * @param {number | Percent} Right
         */
        set: function (value) {
            if (this.right != value) {
                this._right = value;
                this._align = "none";
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "top", {
        /**
         * @return {boolean} Top
         */
        get: function () {
            return this.adapter.apply("top", this._top);
        },
        /**
         * "top" coordinate of a non-aligned (`verticalAlign = "none"`) popup.
         *
         * Can be either absolute pixel value, or relative (`Percent`).
         *
         * Setting this property will automatically set `verticalAlign` to "none".
         *
         * NOTE: The position is relative to the chart container.
         *
         * @param {number | Percent} Top
         */
        set: function (value) {
            if (this.top != value) {
                this._top = value;
                this._verticalAlign = "none";
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "bottom", {
        /**
         * @return {boolean} Bottom
         */
        get: function () {
            return this.adapter.apply("bottom", this._bottom);
        },
        /**
         * "bottom" coordinate of a non-aligned (`verticalAlign = "none"`) popup.
         *
         * Can be either absolute pixel value, or relative (`Percent`).
         *
         * Setting this property will automatically set `verticalAlign` to "none".
         *
         * NOTE: The position is relative to the chart container.
         *
         * @param {number | Percent} Bottom
         */
        set: function (value) {
            if (this.bottom != value) {
                this._bottom = value;
                this._verticalAlign = "none";
                this.positionElement();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Popup.prototype, "elements", {
        /**
         * Returns an object with references to various elements of the Popup.
         *
         * * `wrapper`
         * * `title`
         * * `content`
         * * `close`
         * * `curtain`
         */
        get: function () {
            return this._elements;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Loads popup CSS.
     *
     * @ignore Exclude from docs
     */
    Popup.prototype.loadDefaultCSS = function () {
        if (!this._cssLoaded) {
            this._disposers.push(popupCSS(this.classPrefix));
            $object.each(this._elements, function (key, el) {
                el.style.display = "";
            });
            this._cssLoaded = true;
        }
    };
    /**
     * If popup is closable, this method adds various events to popup elements.
     */
    Popup.prototype._applyEvents = function () {
        var _this = this;
        if (this._IOs.close) {
            if (this.closable) {
                this._IOs.close.element.style.visibility = "visible";
                var disposers = [
                    getInteraction().body.events.on("keyup", function (ev) {
                        if (keyboard.isKey(ev.event, "esc") && _this.closable) {
                            _this.close();
                        }
                    }),
                    this._IOs.close.events.on("hit", function (ev) {
                        _this.close();
                    })
                ];
                disposers.push(this._IOs.curtain.events.on("hit", function (ev) {
                    if (_this.showCurtain) {
                        _this.close();
                    }
                }));
                this._disposers.push(new MultiDisposer(disposers));
            }
            else {
                this._IOs.close.element.style.visibility = "hidden";
            }
        }
    };
    /**
     * Disables interactivity on parent chart.
     */
    Popup.prototype._disablePointers = function () {
        this._spriteInteractionsEnabled = this.sprite.interactionsEnabled;
        this.sprite.interactionsEnabled = false;
    };
    /**
     * Releases temporarily disabled pointers on parent chart.
     */
    Popup.prototype._releasePointers = function () {
        if ($type.hasValue(this._spriteInteractionsEnabled)) {
            this.sprite.interactionsEnabled = this._spriteInteractionsEnabled;
            this._spriteInteractionsEnabled = undefined;
        }
    };
    /**
     * Copies all properties and related data from different element.
     *
     * @param {this} object Source element
     */
    Popup.prototype.copyFrom = function (source) {
        _super.prototype.copyFrom.call(this, source);
        this.container = source.container;
        this.sprite = source.sprite;
        this.classPrefix = source.classPrefixRaw;
        this.content = source.content;
        this.title = source.title;
        this.readerTitle = source.readerTitle;
        this.defaultStyles = source.defaultStyles;
        this.showCurtain = source.showCurtain;
        this.align = source.align;
        this.verticalAlign = source.verticalAlign;
        this.left = source.left;
        this.right = source.right;
        this.top = source.top;
        this.bottom = source.bottom;
        this.adapter.copyFrom(source.adapter);
    };
    return Popup;
}(BaseObject));
export { Popup };
//# sourceMappingURL=Popup.js.map