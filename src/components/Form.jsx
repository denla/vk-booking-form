import React, { useState, useEffect } from 'react';
import { Icon28CheckCircleOutline } from '@vkontakte/icons';

import {
  Title,
  FormItem,
  Select,
  DateInput,
  Button,
  ButtonGroup,
  Snackbar,
  Textarea,
  FormLayoutGroup,
  Group,
  FormLayout,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

const Form = () => {
  //Контролируем селекты и textarea
  const [tower, setTower] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState();
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [text, setText] = useState('');

  //Храним забронированные переговорки
  const [list, setList] = useState([]);

  const [snackbar, setSnackbar] = React.useState(null);
  const [invalid, setInvalid] = useState(false);

  //Этажи от 3 до 27
  const floors = [];
  for (let i = 3; i <= 27; i++) {
    floors.push({ label: i, value: i });
  }

  //Номера переговорок от 1 до 10
  const rooms = Array(10)
    .fill()
    .map((e, i) => ({ label: i + 1, value: i + 1 }));

  let timesFrom = [];
  let filteredList;
  if (date) {
    timesFrom = [];
    let currentDate = new Date();
    let isTimeDisabled = false;

    filteredList = list.filter(
      (item) =>
        item.tower === tower &&
        item.floor === floor &&
        item.room === room &&
        item.date.toString() === date.toString(),
    );

    //Генерируем массив options для выпадающего списка с временем начала переговоров
    for (let i = 18; i < 42; i++) {
      let newDate = new Date(date.getTime() + i * 30 * 60000);
      let newTime = newDate.getTime();
      if (newTime < currentDate.getTime()) {
        continue;
      }
      //Ищем уже занятое время
      let busySlots = filteredList.find(
        (item) => item.timeFrom <= newTime.toString() && newTime.toString() < item.timeTo,
      );
      //Делаем неактивным пункт выпадающего списка, если время занято
      busySlots ? (isTimeDisabled = true) : (isTimeDisabled = false);
      //Заполняем массив timesFrom [{label, value}]
      timesFrom.push({
        label: newDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        value: newTime,
        disabled: isTimeDisabled,
      });
    }
  }

  //Заполнение массива timesTo
  let timesTo = [];
  if (date && timeFrom) {
    timesTo = [];
    let isTimeDisabled = false;

    for (let i = 1; i <= 4; i++) {
      let newDate = new Date(+timeFrom + i * 30 * 60000);
      let newTime = newDate.getTime();
      //Проверка на случай, если текущее время уже занято
      let busySlots = filteredList.find(
        (item) => item.timeFrom < newTime.toString() && newTime.toString() <= item.timeTo,
      );
      //Не выводим лишнее
      if (busySlots || (newDate.getHours() === 21 && newDate.getMinutes() > 0)) {
        break;
      }
      //options для sel[{label, value}]
      timesTo.push({
        label: newDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        value: newTime,
        disabled: isTimeDisabled,
      });
    }
  }

  //Очищаем timeTo при изменении значения timeFrom
  useEffect(() => {
    setTimeTo('');
  }, [timeFrom]);

  function printData() {
    setInvalid(true);
    if (date && tower && floor && room && timeFrom && timeTo && text) {
      let obj = {
        tower,
        floor,
        room,
        date,
        timeFrom,
        timeTo,
        text,
      };
      setList([...list, obj]);
      // console.log(list);
      console.log(JSON.stringify(obj));
      clearData();
      openSuccess();
    }
  }

  function clearData() {
    setTower('');
    setFloor('');
    setRoom('');
    setDate();
    setTimeFrom('');
    setTimeTo('');
    setText('');
    setInvalid(false);
  }

  function openSuccess() {
    if (snackbar) return;
    setSnackbar(
      <Snackbar
        onClose={() => setSnackbar(null)}
        before={<Icon28CheckCircleOutline fill="var(--vkui--color_icon_positive)" />}
      >
        Информация выведена в консоль
      </Snackbar>,
    );
  }

  return (
    <div className="form">
      <Group>
        <FormLayout>
          <Title level="2" style={{ margin: 16 }}>
            Выбор переговорной
          </Title>
          <FormItem top="Выбранная башня" status={!tower && invalid ? 'error' : ''}>
            <Select
              placeholder="Выберите башню"
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              options={[
                { label: 'Башня A', value: 'a' },
                { label: 'Башня B', value: 'b' },
              ]}
            />
          </FormItem>
          <FormLayoutGroup mode="horizontal">
            <FormItem top="Выбранный этаж" status={!floor && invalid ? 'error' : ''}>
              <Select
                placeholder="Выберите этаж"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                options={floors}
              />
            </FormItem>
            <FormItem top="Выбранная переговорная" status={!room && invalid ? 'error' : ''}>
              <Select
                placeholder="Выберите переговорную"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                options={rooms}
              />
            </FormItem>
          </FormLayoutGroup>
          <FormItem top="Дата">
            <DateInput
              value={date}
              onChange={setDate}
              style={{ boxSizing: 'border-box' }}
              disablePast={true}
              status={!date && invalid ? 'error' : ''}
              disablePickers={true}
            />
          </FormItem>
          <FormLayoutGroup mode="horizontal">
            <FormItem
              top="Время начала"
              bottom={timeFrom && timeTo ? `${(timeTo - timeFrom) / 60000} минут` : ''}
              status={!timeFrom && invalid ? 'error' : ''}
            >
              <Select
                placeholder="00:00"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                options={timesFrom}
                disabled={date ? false : true}
              />
            </FormItem>
            <FormItem top="До" status={!timeTo && invalid ? 'error' : ''}>
              <Select
                placeholder="00:00"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                options={timesTo}
                disabled={timeFrom ? false : true}
              />
            </FormItem>
          </FormLayoutGroup>
          <FormItem top="Комментарий" status={!text && invalid ? 'error' : ''}>
            <Textarea
              placeholder="Введите комментарий"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </FormItem>
          <ButtonGroup
            mode="horizontal"
            gap="m"
            style={{ padding: '16px', width: '100%', boxSizing: 'border-box' }}
          >
            <Button type="submit" size="l" appearance="accent" onClick={printData} stretched>
              Отправить
            </Button>
            <Button
              size="l"
              appearance="accent"
              stretched
              mode="secondary"
              onClick={(e) => clearData(e)}
              disabled={
                !(date || tower || floor || room || text || timeFrom || timeTo) ? true : false
              }
            >
              Очистить
            </Button>
          </ButtonGroup>
          {snackbar}
        </FormLayout>
      </Group>
    </div>
  );
};

export default Form;
