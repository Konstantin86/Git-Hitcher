/*
		google.maps.ContextMenu v1.0
		
		A context menu for Google Maps API v3
		http://code.martinpearman.co.uk/googlemapsapi/google.maps.ContextMenu/
		
		Copyright Martin Pearman
		Last updated 21st November 2011
		
		developer@martinpearman.co.uk
		
		This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
		This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
		You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
	*/
function initGmapsContextMenu(googleMaps) {

    var gmaps = googleMaps;

    this.googlemaps = this.googlemaps || {};

    googlemaps.ContextMenu = function (map, options, callback) {

        options = options || {};
        this.setMap(map);
        this.classNames_ = options.classNames || {};
        this.map_ = map;
        this.id = options.id;
        this.mapDiv_ = map.getDiv();
        this.menuItems_ = options.menuItems || [];
        this.pixelOffset = options.pixelOffset || new gmaps.Point(10, -5);
        this.callback = callback || null;
        this.eventName = options.eventName || 'menu_item_selected';

        /**
         * [createMenuItem description]
         * @param  {Object} itemOptions An object with a label (required), a className (optional) and an id (optional)
         * @param  {Boolean} before when True, the menuitem is prepended to the menu instead of appended.
         */
        this.createMenuItem = function (itemOptions, before) {
            var self = this;
            if (!self.menu_) {
                console.log('No menu');
                return;
            }
            itemOptions = itemOptions || {};
            var menuItem = document.createElement('div');
            menuItem.innerHTML = itemOptions.label;
            menuItem.className = itemOptions.className || self.classNames_.menuItem;
            menuItem.eventName = itemOptions.eventName || self.eventName;
            if (itemOptions.id) {
                menuItem.id = itemOptions.id;
            }
            //menuItem.style.cssText = 'cursor:pointer; white-space:nowrap; background: light; padding: 5px';

            menuItem.onmouseover = function () { this.style.background = 'whitesmoke'; }
            menuItem.onmouseout = function() { this.style.background='white'; }

            menuItem.onclick = function () {
                gmaps.event.trigger(self, menuItem.eventName, self.position_, itemOptions.eventName);
            };
            if (before) {
                self.menu_.insertBefore(menuItem, self.menu_.firstChild);
            } else if (itemOptions.container_id) {
                document.getElementById(itemOptions.container_id).appendChild(menuItem);
            } else {
                self.menu_.appendChild(menuItem);
            }

        };


        /**
         * [createMenuGroup description]
         * @param  {Boolean} before when True, the menugroup is prepended to the menu instead of appended.
         */
        this.createMenuGroup = function (itemOptions, before) {
            var self = this;
            if (!self.menu_) {
                console.log('No menu');
                return;
            }
            itemOptions = itemOptions || {};
            var menuGroup = document.createElement('span');

            if (itemOptions.id) {
                menuGroup.id = itemOptions.id;
            }
            if (before) {
                self.menu_.insertBefore(menuGroup, self.menu_.firstChild);
            } else {
                self.menu_.appendChild(menuGroup);
            }
        };


        /**
         * [createMenuSeparator description]
         * @param  {Boolean} before when True, the menuitem is prepended to the menu instead of appended.
         */
        this.createMenuSeparator = function (itemOptions, before) {
            var self = this;
            if (!self.menu_) {
                console.log('No menu');
                return;
            }
            itemOptions = itemOptions || {};
            var menuSeparator = document.createElement('div');
            if (self.classNames_.menuSeparator) {
                menuSeparator.className = self.classNames_.menuSeparator;
            }
            if (itemOptions.id) {
                menuSeparator.id = itemOptions.id;
            }
            if (before) {
                self.menu_.insertBefore(menuSeparator, self.menu_.firstChild);
            } else if (itemOptions.container_id) {
                document.getElementById(itemOptions.container_id).appendChild(menuSeparator);
            } else {
                self.menu_.appendChild(menuSeparator);
            }
        };
    };

    googlemaps.ContextMenu.prototype = new gmaps.OverlayView();

    googlemaps.ContextMenu.prototype.draw = function () {

        if (this.isVisible_) {
            var mousePosition = this.getCanvasXY(this.position_);

            this.menu_.style.left = mousePosition.x + 'px';
            this.menu_.style.top = mousePosition.y + 'px';
        }
    };

    googlemaps.ContextMenu.prototype.getCanvasXY = function(caurrentLatLng) {
        var scale = Math.pow(2, this.map_.getZoom());
        var nw = new gmaps.LatLng(
            this.map_.getBounds().getNorthEast().lat(),
        this.map_.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = this.map_.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = this.map_.getProjection().fromLatLngToPoint(caurrentLatLng);
        var caurrentLatLngOffset = new gmaps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
        return caurrentLatLngOffset;
    }

    googlemaps.ContextMenu.prototype.getVisible = function () {
        return this.isVisible_;
    };

    googlemaps.ContextMenu.prototype.hide = function () {
        if (this.isVisible_) {
            this.menu_.style.display = 'none';
            this.isVisible_ = false;
        }
    };

    googlemaps.ContextMenu.prototype.onAdd = function () {

        var $this = this; //	used for closures

        var menu = document.createElement('div');
        if (this.classNames_.menu) {
            menu.className = this.classNames_.menu;
        }
        if (this.id) {
            menu.id = this.id;
        }
        menu.style.cssText = 'display:none; position:absolute;z-index:250;';
        $this.menu_ = menu;
        for (var i = 0, j = this.menuItems_.length; i < j; i++) {
            if (this.menuItems_[i].label) {
                this.createMenuItem(this.menuItems_[i]);
            } else {
                this.createMenuSeparator();
            }
        }
        menu.onmouseover = function () {
            $this.map_.inmenu = true;
            //console.log('Mouseover Menu');
        };
        menu.onmouseout = function () {
            $this.map_.inmenu = false;
            //console.log('mouseout Menu');
        };

        menu.onclick = function() {
            $this.hide();
        };
        //delete this.classNames_;
        delete this.menuItems_;

        this.isVisible_ = false;

        this.position_ = new gmaps.LatLng(0, 0);

        gmaps.event.addListener(this.map_, 'click', function (mouseEvent) {
            //setTimeout(function() {
            //    $this.hide();
            //}, 100);

            $this.hide();
        });
        this.getPanes().floatPane.parentNode.parentNode.appendChild(menu);

        if (this.callback) this.callback();
    };

    googlemaps.ContextMenu.prototype.onRemove = function () {
        this.getPanes().floatPane.appendChild(this.menu);
        this.menu_.parentNode.removeChild(this.menu_);
        delete this.mapDiv_;
        delete this.menu_;
        delete this.position_;
    };

    googlemaps.ContextMenu.prototype.show = function (latLng) {
        if (!this.isVisible_) {
            this.menu_.style.display = 'block';
            this.isVisible_ = true;
        }
        this.position_ = latLng;
        this.draw();

    };
};