import './dropdown.css';
import keyMap from '../keymap.json';

const KEY_CODE_UP = 38;
const KEY_CODE_DOWN = 40;
const KEY_CODE_ENTER = 13;
const KEY_CODE_ESC = 27;
const delay = (function(){
    let timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();
class DropDownComponent {
    constructor(options) {
        if (!options.element) return;

        const defaultOptions = {
            multiselect: false,
            autocomplete: false,
            list: [],
            listZIndex: 900,
            emptyListText: 'Совпадений не найдено',
            showImage: false
        };

        this.options = Object.assign(defaultOptions, options);
        this.element = options.element;

        this.init();
        this.render();
    }

    init() {
        this.list = this.options.list.map(item => Object.assign(item, {
            id: String(item.id),
            selected: false
        }));
        this.selectedList = [];
        this.selectionCompleted = false;

        if (this.options.autocomplete) {
            this.filteredList = this.list;
            this.inputValue = '';
        }
    }

    publiclyTrigger(name, context, args) {
        const optHandler = this.options[name];

        if (optHandler) {
            return optHandler.apply(context, args || []);
        }

        return null;
    }

    addListener(element, event, handler) {
        const handlerName = `${handler}WithBinding`;

        this[handlerName] = this[handler].bind(this);
        element.addEventListener(event, this[handlerName]);
    }

    removeListener(element, event, handler) {
        const handlerName = `${handler}WithBinding`;

        element.removeEventListener(event, this[handlerName]);
        delete this[handlerName];
    }

    createElement(tag, options) {
        const element = document.createElement(tag);

        if (options.classes) {
            const classArray = typeof options.classes === 'string' ? [options.classes] : options.classes;

            classArray.forEach((item) => {
                element.classList.add(item);
            });
        }

        if (options.text) {
            element.innerText = options.text;
        }

        if (options.attrs) {
            options.attrs.forEach((attr) => {
                element.setAttribute(attr.name, attr.data);
            });
        }

        return element;
    }

    render() {
        const wrap = this.createElement('div', {
            classes: 'dropdown',
            attrs: [{
                    name: 'tabindex',
                    data: 0
                }]
        });
        const selectWrap = this.renderSelectionWrap();
        const listBox = this.renderList();

        selectWrap.addEventListener('click', this.onSelectClick.bind(this));
        listBox.addEventListener('click', this.onListClick.bind(this));

        wrap.appendChild(selectWrap);
        wrap.appendChild(listBox);
        wrap.addEventListener('keydown', this.onSelectKeyDown.bind(this));

        this.element.appendChild(wrap);
        this.updateSelectionState();
        this.bindEvents();
    }

    bindEvents() {
        this.addListener(document, 'click', 'onDocumentClick');
        this.addListener(document, 'touchstart', 'onDocumentClick');
    }

    onDocumentClick(e) {
        let node = e.target;

        while (node) {
            if (node === this.element) {
                return;
            }

            node = node.parentElement;
        }

        this.closeListBox();
    }

    onSelectKeyDown(e) {
        switch (e.keyCode) {
            case KEY_CODE_ENTER: {
                if (!this.isOpen) {
                    this.openListBox();
                }

                break;
            }
            case KEY_CODE_ESC: {
                if (this.isOpen) {
                    this.closeListBox();
                }

                break;
            }
        }
    }

    renderList() {
        const ulElement = this.createElement('ul', { classes: 'dropdown-list' });

        ulElement.style.zIndex = String(this.options.listZIndex);

        this.list.forEach((listItem, i) => {
            const liElement = this.renderListItem(listItem, i);

            ulElement.appendChild(liElement);
        });

        if (this.options.autocomplete) {
            ulElement.appendChild(this.renderNoResult());
        }

        this.addListener(ulElement, 'mouseover', 'onListMouseover');

        return ulElement;
    }

    renderListItem(listItem, i) {
        const classes = i ? 'dropdown-list__item' : ['dropdown-list__item', 'active'];
        const liElement = this.createElement('li', {
            classes,
            attrs: [{ name: 'data-id', data: listItem.id }]
        });

        if (this.options.showImage) {
            const avatarElement = this.createElement('div', {
                classes: 'dropdown-list__item-avatar'
            });

            avatarElement.innerHTML = `<img src="${listItem.url}" />`;
            liElement.appendChild(avatarElement);
        }

        liElement.appendChild(document.createTextNode(listItem.label));

        return liElement;
    }

    renderNoResult() {
        const noResultElem = this.createElement('li', {
            classes: ['dropdown-list__item', 'dropdown-list__item--no-result', 'hidden'],
            text: this.options.emptyListText
        });

        noResultElem.addEventListener('click', this.closeListBox.bind(this));

        return noResultElem;
    }

    renderSelectionWrap() {
        const fragment = document.createDocumentFragment();
        const selectionWrap = this.createElement('div', { classes: ['dropdown-selection', 'clearfix'] });
        const arrowElement = this.createElement('div', { classes: 'dropdown-selection__arrow' });

        fragment.appendChild(this.renderSelectedValues());

        if (this.options.multiselect) {
            const addNewValueElem = this.createElement('div', {
                classes: 'dropdown-selection__add-new',
                text: 'Добавить'
            });

            fragment.appendChild(addNewValueElem);
        }

        fragment.appendChild(arrowElement);

        if (this.options.autocomplete) {
            fragment.appendChild(this.renderInput());
        } else {
            fragment.appendChild(this.renderPlaceHolder());
        }

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
        const inputElem = this.createElement('input', {
            attrs: [{ name: 'placeholder', data: this.options.placeholder }],
            classes: 'dropdown-selection__input'
        });

        inputElem.addEventListener('keyup', this.onInputKeyUp.bind(this));

        return inputElem;
    }

    renderPlaceHolder() {
        return this.createElement('div', {
            classes: ['dropdown-selection__placeholder', 'dropdown-selection__block'],
            text: this.options.placeholder
        });
    }

    rerenderSelection() {
        const selectedValuesEl = this.element.querySelector('.dropdown-selection__values');

        while (selectedValuesEl.firstChild) {
            selectedValuesEl.removeChild(selectedValuesEl.firstChild);
        }

        if (this.selectedList.length) {
            const fragment = document.createDocumentFragment();

            this.selectedList.forEach((item) => {
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
        const belongsToFilteredList = item => this.options.autocomplete
            ? (this.filteredList.indexOf(item) !== -1)
            : true;
        const visibleList = this.list.filter(item => !item.selected && belongsToFilteredList(item));
        const items = this.element.querySelectorAll('.dropdown-list__item');

        if (!visibleList.length && this.options.autocomplete) {
            items.forEach((item) => {
                if (!item.classList.contains('dropdown-list__item--no-result')) {
                    item.classList.add('hidden');
                } else {
                    item.classList.remove('hidden');
                }
            });

            const activeElem = this.element.querySelector('.dropdown-list .active');

            if (activeElem) {
                activeElem.classList.remove('active');
            }
        } else {
            items.forEach((itemElement) => {
                const itemId = itemElement.getAttribute('data-id');
                const containsItem = item => item.id === itemId;

                if (visibleList.some(containsItem)) {
                    if (visibleList[0].id === itemId) {
                        this.changeActiveItem(this.element.querySelector('.dropdown-list .active'), itemElement);
                        this.updateScrollPosition(itemElement);
                    }

                    itemElement.classList.remove('hidden');
                } else {
                    itemElement.classList.add('hidden');
                }
            });
        }

        this.updateListTopPosition();
    }

    updateSelectionState() {
        const selection = this.element.querySelector('.dropdown-selection');

        if (this.selectedList.length) {
            this.setSelectionUnempty(selection);
        } else {
            this.setSelectionEmpty(selection);
        }

        if (this.options.multiselect) {
            const unselectedList = this.list.filter(item => !item.selected);

            if (unselectedList.length) {
                this.setSelectionUncompleted(selection);
            } else {
                this.setSelectionCompleted(selection);
            }
        } else if (this.selectedList.length) {
            this.setSelectionCompleted(selection);
        } else {
            this.setSelectionUncompleted(selection);
        }
    }

    setSelectionCompleted(selectionElem) {
        selectionElem.classList.add('dropdown-selection--selected-state');
        this.selectionCompleted = true;
    }

    setSelectionUncompleted(selectionElem) {
        selectionElem.classList.remove('dropdown-selection--selected-state');
        this.selectionCompleted = false;
    }

    setSelectionEmpty(selectionElem) {
        selectionElem.classList.add('dropdown-selection--empty-state');
    }

    setSelectionUnempty(selectionElem) {
        selectionElem.classList.remove('dropdown-selection--empty-state');
    }

    updateSearchState(input) {
        this.inputValue = input.value;

        if (input.value) {
            input.parentElement.classList.add('search-active');
        } else {
            input.parentElement.classList.remove('search-active');
        }
    }
    
    rerender() {
        this.rerenderSelection();
        this.rerenderList();
        this.updateSelectionState();
    }

    onListClick(e) {
        const { target } = e;
        const itemElement = target.closest('.dropdown-list__item');

        if (!itemElement.classList.contains('dropdown-list__item--no-result')) {
            const id = itemElement.getAttribute('data-id');

            this.selectOption(id);
        }
    }

    onSelectClick(e) {
        const { target } = e;

        if (target.closest('.dropdown-selection__value') || this.selectionCompleted) return;

        if (!this.isOpen) {
            this.openListBox();
        } else if (!(this.options.autocomplete && target.closest('.dropdown-selection__input'))) {
            this.closeListBox();
        }
    }

    onInputKeyUp(event) {
        const { target } = event;
        const programsKeyCodes = [KEY_CODE_DOWN, KEY_CODE_ENTER, KEY_CODE_UP];

        if (programsKeyCodes.indexOf(event.keyCode) === -1 && this.inputValue !== target.value) {
            this.updateSearchState(target);

            this.filterListItems(target.value);
            this.rerenderList();
        }
    }
    
    onListMouseover(e) {
        const hoverItem = this.element.querySelector('.dropdown-list .active');
        const { target } = e;
        const { classList } = target;

        if (target !== hoverItem
            && classList.contains('dropdown-list__item')
            && !classList.contains('dropdown-list__item--no-result')) {
            this.changeActiveItem(hoverItem, e.target);
        }
    }

    filterListItems(text) {
        const textArray = text.trim().toLowerCase().split(/\s+/g);
        const filter = (item, array) => array.every(word => item.label.toLowerCase().indexOf(word) !== -1);
        const unselectedList = this.list.filter(item => !item.selected);
        const getTextFromKeyMap = (originalTextArray, property) => {
            return originalTextArray.map((originalText) => {
                let result = '';

                for (let i = 0; i <= originalText.length - 1; i++) {
                    const originalChar = originalText.charAt(i);
                    const charModel = keyMap[originalChar];
                    const char = charModel ? charModel[property] : originalChar;

                    if (char) result += char;
                    else return '';
                }

                return result;
            });
        };
        const getFilteredList = (convertedArray) => {
            return convertedArray.every(i => i)
                ? unselectedList.filter((item) => filter(item, convertedArray))
                : [];
        };
        let filteredList = unselectedList.filter((item) => filter(item, textArray));

        if (!filteredList.length) {
            const oppositeText = getTextFromKeyMap(textArray, 'opposite');

            filteredList = getFilteredList(oppositeText);

            if (!filteredList.length) {
                const translitText = getTextFromKeyMap(textArray, 'translit');

                filteredList = getFilteredList(translitText);

                if (!filteredList.length) {
                    const oppositeTranslitText = getTextFromKeyMap(getTextFromKeyMap(textArray, 'opposite'), 'translit');

                    filteredList = getFilteredList(oppositeTranslitText);

                    if (!filteredList.length && this.options.extendedSearch) {
                        delay(() => {
                            const args = [textArray, oppositeText, translitText, oppositeTranslitText];

                            this.extendedSearch(args.filter(b => b.every(c => c)).map(a => a.toString()));
                        }, 200);
                    }
                }
            }
        }

        this.filteredList = filteredList;
    }

    extendedSearch(strList) {
        const request = new XMLHttpRequest();

        request.addEventListener('load', this.extendedSearchListener.bind(this, request));
        request.open('POST', 'api/search.php', true);
        request.send(JSON.stringify({ seachKey: strList }));
    }

    extendedSearchListener(request) {
        const unselectedList = this.list.filter(item => !item.selected);
        const response = JSON.parse(request.response);

        this.filteredList = response
            ? unselectedList.filter((item) => response.indexOf(item.id) !== -1)
            : [];
        this.rerenderList();
    }

    selectOption(itemId) {
        const value = this.list.find(item => item.id === itemId);

        value.selected = true;

        if (this.options.autocomplete) {
            const input = this.element.querySelector('.dropdown-selection__input');
            
            input.value = '';
            this.updateSearchState(input);
            this.filteredList = this.list;
        }

        if (!this.options.multiselect) {
            this.clearSelectedList();
        }

        this.addSelectedValue(value);
        this.triggerOnChange();
        this.rerender();

        const unselectedList = this.list.filter(item => !item.selected);

        if (!(this.options.multiselect && unselectedList.length) || this.options.autocomplete) {
            this.closeListBox();
        }
    }

    unSelectOption(itemId) {
        const value = this.list.find(item => item.id === itemId);

        value.selected = false;
        this.removeSelectedValue(itemId);
        this.triggerOnChange();
        this.rerender();
    }

    triggerOnChange() {
        const value = this.options.multiselect
            ? this.selectedList.map(item => item.id)
            : this.selectedList[0] && this.selectedList[0].id;

        this.publiclyTrigger('onChange', this, [value]);
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

    openListBox() {
        const wrapper = this.element.querySelector('.dropdown');
        const listElement = this.element.querySelector('.dropdown-list');
        const firstItem = listElement.querySelector('.dropdown-list__item');

        this.changeActiveItem(listElement.querySelector('.active'), firstItem);
        this.updateScrollPosition(firstItem);

        wrapper.classList.add('is-open');
        this.isOpen = true;

        this.setListPosition();
        listElement.classList.add('visible');

        this.publiclyTrigger('onOpen', this.element);

        setTimeout(this.addListener.bind(this, document, 'keydown', 'onKeyDown'), 100);

        if (this.options.autocomplete) {
            this.element.querySelector('.dropdown-selection__input').focus();
        }
    }

    setListPosition() {
        const wrapper = this.element.querySelector('.dropdown');
        const listElement = this.element.querySelector('.dropdown-list');
        const listElementCoords = listElement.getBoundingClientRect();
        const listElementHeight = listElement.clientHeight;
        const isEnoughSpaceBelow = (window.innerHeight - listElementCoords.bottom) >= 0;
        const isEnoughSpaceAbove = wrapper.getBoundingClientRect().top >= listElementHeight;

        if (!isEnoughSpaceBelow && isEnoughSpaceAbove) {
            listElement.classList.add('display-above');
            listElement.style.top = `${-1 * listElementHeight}px`;
        }
    }

    updateListTopPosition() {
        const listElement = this.element.querySelector('.dropdown-list');

        if (listElement.classList.contains('display-above')) {
            listElement.style.top = `${-1 * listElement.clientHeight}px`;
        }
    }

    closeListBox() {
        const wrapper = this.element.querySelector('.dropdown');
        const listElement = wrapper.querySelector('.dropdown-list');

        wrapper.classList.remove('is-open');
        this.isOpen = false;
        listElement.style.top = '';
        listElement.classList.remove('display-above');

        this.publiclyTrigger('onClose', this.element);

        this.removeListener(document, 'keydown', 'onKeyDown');
    }

    onKeyDown(e) {
        const hoverItem = this.element.querySelector('.dropdown-list .active');

        if (!hoverItem) return;

        switch (e.keyCode) {
            case KEY_CODE_UP: {
                this.onKeyUpDown(hoverItem, 'up');

                break;
            }
            case KEY_CODE_DOWN: {
                this.onKeyUpDown(hoverItem, 'down');

                break;
            }
            case KEY_CODE_ENTER: {
                this.selectOption(hoverItem.getAttribute('data-id'));

                break;
            }
        }
    }

    onKeyUpDown(oldHoverItem, direction) {
        const activeElementProperety = direction === 'up' ? 'previousSibling' : 'nextSibling';
        let newHoverItem = oldHoverItem[activeElementProperety];

        while(newHoverItem && newHoverItem.classList.contains('hidden')) {
            newHoverItem = newHoverItem[activeElementProperety];
        }

        if (newHoverItem) {
            this.changeActiveItem(oldHoverItem, newHoverItem);
            this.updateScrollPosition(newHoverItem);
        }
    }

    updateScrollPosition(activeElem) {
        const ulElement = this.element.querySelector('.dropdown-list');
        const scrollTop = ulElement.scrollTop;
        const ulHeight = ulElement.offsetHeight;
        const liOffsetTop = activeElem.offsetTop;
        const liOffsetBottom = liOffsetTop + activeElem.offsetHeight;

        this.removeListener(ulElement, 'mouseover', 'onListMouseover');

        if (liOffsetTop < scrollTop) {
            ulElement.scrollTop = liOffsetTop;
        } else if (liOffsetBottom > (scrollTop + ulHeight)) {
            ulElement.scrollTop = liOffsetBottom - ulHeight;
        }

        setTimeout(this.addListener.bind(this, ulElement, 'mouseover', 'onListMouseover'), 100);
    }

    changeActiveItem(oldElem, newElem) {
        if (oldElem) oldElem.classList.remove('active');
        newElem.classList.add('active');
    }

    updateOptions(options) {
        this.options = Object.assign(this.options, options);
        this.destroy();
        this.render();
    }

    destroy() {
        const wrap = this.element.querySelector('.dropdown');

        this.element.removeChild(wrap);
        this.removeListener(document, 'click', 'onDocumentClick');
        this.removeListener(document, 'touchstart', 'onDocumentClick');

        this.init();
    }
}

export default DropDownComponent;
