(function(e){
    e.closest = e.closest || function(css){
        var node = this;

        while (node) {
            if (node.matches(css)) return node;
            else node = node.parentElement;
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
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

})(Element.prototype);