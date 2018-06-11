(function(e) {
    e.closest = e.closest || function(css) {
        let node = this;

        while (node) {
            if (node.matches(css)) {
                return node;
            }

            node = node.parentElement;
        }

        return null;
    };

    if (!e.matches) {
        e.matches =
            e.matchesSelector ||
            e.mozMatchesSelector ||
            e.msMatchesSelector ||
            e.oMatchesSelector ||
            e.webkitMatchesSelector ||
            function(s) {
                const matches = (this.document || this.ownerDocument).querySelectorAll(s);
                let i = matches.length;

                while (--i >= 0 && matches.item(i) !== this) {}

                return i > -1;
            };
    }

    if (typeof Object.assign !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                const to = Object(target);

                for (let index = 1; index < arguments.length; index++) {
                    const nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                        for (let nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }
}(Element.prototype));
