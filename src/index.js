import './polyfill.js';
import DropDownComponent from './dropdown';
import './index.css';
import * as imgs from './images';

(function() {
    const dropDownValueElem = document.getElementById('drop-down-value');
    const select = new DropDownComponent({
        element: document.getElementById('drop-down-user'),
        list: dropdownInput,
        placeholder: 'Выберите друга',
        onChange: function (value) {
            let text = '';

            if (typeof value === 'string') {
                text = dropdownInput.find(item => item.id == value).label;
            }

            if (typeof value === 'object') {
                text = String(value.map(id => dropdownInput.find(item => item.id == id).label));
            }

            dropDownValueElem.innerText = text;
        }
    });
    const updateDropDownModel = (options) => {
        dropDownValueElem.innerText = '';
        select.updateOptions(options);
    };

    document.getElementById('multiselect-option').addEventListener('change', function(e) {
        updateDropDownModel({
            multiselect: this.checked,
            placeholder: this.checked ? 'Введите имя друга': 'Выберите друга'
        });
    });

    document.getElementById('autocomplete-option').addEventListener('change', function(e) {
        updateDropDownModel({
            autocomplete: this.checked,
            emptyListText: 'Пользователь не найден'
        });
    });

    document.getElementById('show-image-option').addEventListener('change', function(e) {
        updateDropDownModel({
            showImage: this.checked
        });
    });

    document.getElementById('extended-search-option').addEventListener('change', function(e) {
        updateDropDownModel({
            extendedSearch: {
                url: 'search?field=nickname',
                field: 'nickname'
            }
        });
    });

    const select2 = new DropDownComponent({
        element: document.getElementById('drop-down-additional'),
        multiselect: true,
        list: [{ id: 1, label: 'Хан Соло'}, { id: 2, label: 'Люк Скайвокер'}],
        placeholder: 'Выберите друга'
    });
}());
