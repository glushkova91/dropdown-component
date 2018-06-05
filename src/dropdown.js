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
        this.list = options.list.map(item => Object.assign(item, {id: String(item.id)}));
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
            const classArray = typeof options.classes === 'string' ? [options.classes]: options.classes;

            classArray.forEach((item) => {
                element.classList.add(item);
            });
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
        const wrap = this.createElement('div', { classes: 'dropdown' });
        const selectWrap = this.renderSelectionWrap();
        const listBox = this.renderList();

        selectWrap.addEventListener('click', this.onSelectClick.bind(this));
        listBox.addEventListener('click', this.onListClick.bind(this));

        wrap.appendChild(selectWrap);
        wrap.appendChild(listBox);

        this.element.appendChild(wrap);
    }

    renderList() {
        const ulElement = this.createElement('ul', { classes: 'dropdown-list' });

        this.list.forEach((listItem) => {
            const liElement = this.createElement('li', {
                text: listItem.label,
                classes: 'dropdown-list__item',
                attrs: [{ name: 'data-id', data: listItem.id }]
            });

            ulElement.appendChild(liElement);
        });

        return ulElement;
    }

    renderSelectionWrap() {
        const fragment = document.createDocumentFragment();
        const selectionWrap = this.createElement('div', { classes: 'dropdown-selection' });
        const arrowElement = this.createElement('div', { classes: 'dropdown-selection__arrow' });

        if (this.options.autocomplete) {
            fragment.appendChild(this.renderInput());
        } else {
            fragment.appendChild(this.renderPlaceHolder());
        }

        fragment.appendChild(this.renderSelectedValues());
        fragment.appendChild(arrowElement);

        if (this.options.multiselect && !this.options.autocomplete) {
            selectionWrap.classList.add('display-selected-items');
        }

        selectionWrap.appendChild(fragment);

        return selectionWrap;
    }

    renderSelectedValues() {
        const selectedValuesElem = this.createElement('div', {
            classes: 'dropdown-selection__values'
        });

        selectedValuesElem.addEventListener('click', (e) => {
            if (e.target.classList.contains('selection__delete')) {
                this.unSelectOption(e.target.getAttribute('data-id'));
            }
        });
        return selectedValuesElem;
    }

    renderInput() {
        return this.createElement('input', {
            attrs: [{ name: 'placeholder', data: this.options.placeholder }]
        });
    }

    renderPlaceHolder() {
        return this.createElement('div', {
            classes: 'dropdown-selection__placeholder',
            text: this.options.placeholder
        });
    }

    rerenderSelection() {
        const selectedValuesEl = this.element.querySelector('.dropdown-selection__values');
        const placeholderElement = this.element.querySelector('.dropdown-selection__placeholder');

        selectedValuesEl.innerHTML = '';

        if (this.selectedList.length === 0) {
            if (placeholderElement.classList.contains('hidden')) {
                placeholderElement.classList.remove('hidden');
            }
        } else {
            const fragment = document.createDocumentFragment();

            placeholderElement.classList.add('hidden');

            this.selectedList.forEach(item => {
                const valueEl = this.createElement('div', {
                    classes: ['dropdown-selection__value', 'selection']
                });
                const labelEl = this.createElement('div', {
                    text: item.label,
                    classes: 'selection__label'
                });
                const deleteBtn = this.createElement('div', {
                    classes: 'selection__delete',
                    attrs: [{ name: 'data-id', data: item.id }]
                });

                valueEl.appendChild(labelEl);
                valueEl.appendChild(deleteBtn);

                fragment.appendChild(valueEl);
            });

            selectedValuesEl.appendChild(fragment);
        }
    }

    rerenderList() {
        this.element.querySelectorAll('.dropdown-list__item').forEach((itemElement) => {
            const itemId = itemElement.getAttribute('data-id');

            if (this.selectedList.some(selectedItem => selectedItem.id === itemId)) {
                itemElement.classList.add('disable');
            } else {
                itemElement.classList.remove('disable');
            }
        })
    }

    rerender() {
        this.rerenderSelection();
        this.rerenderList();
    }

    onListClick(e) {
        const id = e.target.getAttribute('data-id');

        this.selectOption(id);
    }

    onSelectClick(e) {
        const wrapper = e.currentTarget.parentElement;
        const target = e.target;

        if (target.closest('.dropdown-selection__value')) return;

        if (!wrapper.classList.contains('is-open')) {
            wrapper.classList.add('is-open');
        } else {
            wrapper.classList.remove('is-open');
        }
    }

    selectOption(itemId) {
        const value = this.list.find(item => item.id === itemId);

        if(!this.options.multiselect) {
            this.clearSelectedList();
        }

        this.addSelectedValue(value);
        this.rerender();

        if (!this.options.multiselect || options.autocomplete) {
            this.closeListBox();
        }
    }

    unSelectOption(itemId) {
        this.removeSelectedValue(itemId);
        this.rerender();
    }

    addSelectedValue(value) {
        this.selectedList.push(value);
    }

    removeSelectedValue(id) {
        const i = this.selectedList.findIndex(item => item.id === id);

        this.selectedList.splice(i, 1);
    }

    clearSelectedList() {
        this.selectedList = [];
    }

    closeListBox() {
        const wrapper = this.element.querySelector('.dropdown');

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
