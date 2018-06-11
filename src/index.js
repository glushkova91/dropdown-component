import './polyfill.js';
import DropDownComponent from './dropdown';
import './index.css';
import * as imgs from './images';

(function() {
    const select1 = new DropDownComponent({
        element: document.getElementById('drop-down-user'),
        list: [
            { id: 1, label: 'Хан Соло'},
            { id: 2, label: 'Люк Скайвокер'},
            { id: 3, label: 'Princess Lea'},
            { id: 4, label: 'Chewbacca'}
            ],
        placeholder: 'Выберите друга'
    });

    document.getElementById('multiselect-option').addEventListener('change', function(e) {
        select1.updateOptions({
            multiselect: this.checked,
            placeholder: this.checked ? 'Введите имя друга': 'Выберите друга'
        });
    });

    document.getElementById('autocomplete-option').addEventListener('change', function(e) {
        select1.updateOptions({
            autocomplete: this.checked,
            emptyListText: 'Пользователь не найден'
        });
    });

    document.getElementById('show-image-option').addEventListener('change', function(e) {
        select1.updateOptions({
            showImage: this.checked,
            list: [
                { id: 1, label: 'Хан Соло', url: 'dist/images/solo.jpg'},
                { id: 2, label: 'Люк Скайвокер', url: 'dist/images/luk.jpg'}],
        });
    });

    // const select2 = new DropDownComponent({
    //     element: document.getElementById('drop-down-multiselect'),
    //     multiselect: true,
    //     list: [{ id: 1, label: 'Хан Соло'}, { id: 2, label: 'Люк Скайвокер'}],
    //     placeholder: 'Выберите друга'
    // });
    //
    // const select3 = new DropDownComponent({
    //     element: document.getElementById('drop-down-autocomplete'),
    //     autocomplete: true,
    //     list: [{ id: 1, label: 'Хан Соло' }, { id: 2, label: 'Люк Скайвокер' }],
    //     placeholder: 'Введите имя друга'
    // });
    // const select4 = new DropDownComponent({
    //     element: document.getElementById('drop-down-multiselect-autocomplete'),
    //     autocomplete: true,
    //     multiselect: true,
    //     list: [{ id: 1, label: 'Хан Соло' }, { id: 2, label: 'Люк Скайвокер' }],
    //     placeholder: 'Введите имя друга'
    // });
}());
