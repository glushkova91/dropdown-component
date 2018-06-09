import './polyfill.js';
import DropDownComponent from './dropdown';
import './index.css';

(function () {
    const select1 = new DropDownComponent({
        element: document.getElementById('drop-down-user'),
        list: [{ id: 1, label: 'Хан Соло'}, { id: 2, label: 'Люк Скайвокер'}],
        placeholder: 'Выберите друга'
    });

    const select2 = new DropDownComponent({
        element: document.getElementById('drop-down-multiselect'),
        multiselect: true,
        list: [{ id: 1, label: 'Хан Соло'}, { id: 2, label: 'Люк Скайвокер'}],
        placeholder: 'Выберите друга'
    });
})();