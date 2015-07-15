import React from 'react/addons';

export class SideBar extends React.Component {
    render() {
        return (
            <div>
                <ul>
                    <li>Аккаунт</li>
                    <li>Список маршрутов</li>
                    <li>Мои маршруты</li>
                    <li>Добавить маршрут</li>
                    <li>Топ мест</li>
                    <li>Выход</li>
                </ul>
                <div className="sidebar-logo">
                PUB&amp; BARS
                </div>
            </div>
        )
    }
};