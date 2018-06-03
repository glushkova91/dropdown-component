import DropDownComponent from './dropdown';

(function () {
    const select1 = new DropDownComponent({
        element: document.getElementById('drop-down-user'),
        list: [{ id: 1, label: 'Хан Соло'}, { id: 2, label: 'Люк Скайвокер'}],
        placeholder: 'Выберите друга'
    });
})();