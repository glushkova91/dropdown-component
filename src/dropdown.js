import './dropdown.css';

class DropDownComponent {
    constructor(options) {
        if (!options.element) return;

        const defaultOptions = {
            multiselect: false,
            autocomplete: false,
            list: []
        };

        this.options = Object.assign(defaultOptions, options);
        this.element = options.element;
        this.list = options.list;
        this.selectedList = [];
        this.render();
    }

    publiclyTrigger(name, context, args) {
        const optHandler = this.options[name];

        if (optHandler) {
            return optHandler.apply(context, args || []);
        }
    }

    createElement(tag, options) {
        const element = document.createElement(tag);

        if (options.classes) {
            element.classList.add(options.classes);
        }

        if (options.text) {
            element.innerText = options.text;
        }

        if (options.attrs) {
            options.attrs.forEach(attr => {
                element.setAttribute(attr.name, attr.data);
            });
        }

        return element
    }

    render() {
        const wrap = this.createElement('div', { classes: 'dropdown-wrapper' });
        const selectWrap = this.renderSelectionWrap();
        const listBox = this.renderList();

        selectWrap.addEventListener('click', this.onSelectClick.bind(this));
        listBox.addEventListener('click', this.onListClick.bind(this));

        wrap.appendChild(selectWrap);
        wrap.appendChild(listBox);

        this.element.appendChild(wrap);
    }

    renderList() {
        const ulElement = this.createElement('ul', { classes: 'dropdown-list-box' });

        this.list.forEach((listItem) => {
            const liElement = this.createElement('li', {
                text: listItem.label,
                classes: 'dropdown-list-item',
                attrs: [{ name: 'data-id', data: listItem.id }]
            });

            ulElement.appendChild(liElement);
        });

        return ulElement;
    }

    renderSelectionWrap() {
        const fragment = document.createDocumentFragment();
        const selectionWrap = this.createElement('div', { classes: 'dropdown-selection-wrap' });
        const arrowElement = this.createElement('div', { classes: 'selection-arrow' });

        if (this.options.autocomplete) {
            fragment.appendChild(this.renderInput());
        } else {
            fragment.appendChild(this.renderPlaceHolder());
        }

        fragment.appendChild(this.renderSelectedValues());
        fragment.appendChild(arrowElement);

        selectionWrap.appendChild(fragment);

        return selectionWrap;
    }

    renderSelectedValues() {
        return this.createElement('div', {
            classes: 'dropdown-selected-values'
        });
    }

    renderInput() {
        return this.createElement('input', {
            attrs: [{ name: 'placeholder', data: this.options.placeholder }]
        });
    }

    renderPlaceHolder() {
        return this.createElement('div', {
            classes: 'dropdown-placeholder',
            text: this.options.placeholder
        });
    }

    rerenderSelection() {
        const selectedValuesEl = this.element.querySelector('.dropdown-selected-values');
        const placeholderElement = this.element.querySelector('.dropdown-placeholder');

        selectedValuesEl.innerHTML = '';

        if (this.selectedList.length === 0) {
            if (placeholderElement.classList.contains('hidden')) {
                placeholderElement.classList.remove('hidden');
            }
        } else {
            const fragment = document.createDocumentFragment();

            placeholderElement.classList.add('hidden');

            this.selectedList.forEach(item => {
                fragment.appendChild(this.createElement('div', { text: item.label }))
            });

            selectedValuesEl.appendChild(fragment);
        }
    }

    rerender() {
        this.render();
    }

    onListClick(e) {
        const id = e.target.getAttribute('data-id');

        this.selectOption(id);
    }

    onSelectClick(e) {
        const wrapper = e.currentTarget.parentElement;

        if (!wrapper.classList.contains('is-open')) {
            wrapper.classList.add('is-open');
        } else {
            wrapper.classList.remove('is-open');
        }
    }

    selectOption(itemId) {
        const value = this.list.find(item => String(item.id) === itemId);

        if(!this.options.multiselect) {
            this.clearSelectedList();
        }

        this.addSelectedValue(value);
        this.rerenderSelection();

        if (!this.options.multiselect || options.autocomplete) {
            this.closeListBox();
        }
    }

    addSelectedValue(value) {
        this.selectedList.push(value);
    }

    clearSelectedList() {
        this.selectedList = [];
    }

    closeListBox() {
        const wrapper = this.element.querySelector('.dropdown-wrapper');

        wrapper.classList.remove('is-open');

        this.publiclyTrigger('onClose', this.element)
    }

    get value() {
        return this.selectedList;
    }

    set value(value) {
        if (value instanceof Array) {
            this.selectedList = value.filter(item => this.list.includes(item));
        } else if (this.list.includes(value)) {
            this.selectedList = [value];
        }
    }

}

export default DropDownComponent;
