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
  const [tower, setTower] = useState('');
  const [floor, setFloor] = useState(0);
  const [room, setRoom] = useState(0);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [text, setText] = useState('');

  //Храним забронированные переговорки
  const [list, setList] = useState<any>([]);

  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [startTimes, setStartTimes] = useState([]);
  const [endTimes, setEndTimes] = useState([]);

  const [invalid, setInvalid] = useState(false);
  const [snackbar, setSnackbar] = React.useState<any>(null);

  React.useEffect(() => {
    setFloors(createNumArr(3, 27));
    setRooms(createNumArr(1, 10));
  }, []);

  const createNumArr = (n: number, m: number) => {
    let arr: any = [];
    for (let i = n; i <= m; i++) {
      arr.push({ label: i, value: i });
    }
    return arr;
  };

  React.useEffect(() => {
    if (date) {
      setStartTimes(createTimeOptions(date.getTime(), 18, 41, true));
    }
    setStartTime(0);
    setEndTime(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, tower, floor, room]);

  React.useEffect(() => {
    if (date && startTime) {
      setEndTimes(createTimeOptions(startTime, 1, 5, false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  //Создаем массив options для выпадающих списков с временем с учетом уже занятых слотов
  const createTimeOptions = (startTime: number, n: number, m: number, isFirst: boolean) => {
    if (date) {
      let arr: any = [];
      let currentDate = new Date();
      let isTimeDisabled;
      let filteredList = list.filter(
        (item) =>
          item.tower === tower &&
          item.floor === floor &&
          item.room === room &&
          item.date.toString() === date.toString(),
      );

      for (let i = n; i <= m; i++) {
        let newDate = new Date(startTime + i * 30 * 60000);
        let newTime = newDate.getTime();
        if (isFirst) {
          if (newTime < currentDate.getTime()) {
            continue;
          }
        }
        //Делаем неактивным занятое время
        if (list) {
          let busySlots = filteredList.find((item) =>
            isFirst
              ? item.time.start.ms <= newTime && newTime < item.time.end.ms
              : item.time.start.ms < newTime && newTime <= item.time.end.ms,
          );
          if (!isFirst) {
            if (busySlots || (newDate.getHours() === 21 && newDate.getMinutes() > 0)) {
              break;
            }
          }
          isTimeDisabled = busySlots ? true : false;
        }

        let obj = {
          label: newDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          value: newTime,
          disabled: isTimeDisabled,
        };
        arr.push(obj);
      }
      return arr;
    }
  };

  useEffect(() => {
    setStartTime(0);
  }, [date]);

  useEffect(() => {
    setEndTime(0);
  }, [startTime]);

  const printData = () => {
    setInvalid(true);
    if (date && tower && floor && room && startTime && endTime) {
      let obj = {
        tower,
        floor,
        room,
        date,
        time: {
          start: {
            ms: startTime,
            locale: {
              ru: new Date(startTime).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          },
          end: {
            ms: endTime,
            locale: {
              ru: new Date(endTime).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          },
        },
        text: text ? text : null,
      };
      setList([...list, obj]);
      console.log(JSON.stringify(obj));
      clearData();
      openSuccess();
    }
  };

  const clearData = () => {
    setTower('');
    setFloor(0);
    setRoom(0);
    setDate(undefined);
    setStartTime(0);
    setEndTime(0);
    setText('');
    setInvalid(false);
  };

  const openSuccess = () => {
    if (snackbar) return;
    setSnackbar(
      <Snackbar
        onClose={() => setSnackbar(null)}
        before={<Icon28CheckCircleOutline fill="var(--vkui--color_icon_positive)" />}
      >
        Информация выведена в консоль
      </Snackbar>,
    );
  };

  return (
    <div className="form">
      <Group>
        <FormLayout>
          <Title level="2" style={{ margin: 16 }}>
            Выбор переговорной
          </Title>
          <FormItem top="Выбранная башня" status={!tower && invalid ? 'error' : undefined}>
            <Select
              placeholder="Выберите башню"
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              options={[
                { label: 'Башня A', value: 'a' },
                { label: 'Башня Б', value: 'b' },
              ]}
            />
          </FormItem>
          <FormLayoutGroup mode="horizontal">
            <FormItem top="Выбранный этаж" status={!floor && invalid ? 'error' : undefined}>
              <Select
                placeholder="Выберите этаж"
                value={floor}
                onChange={(e) => setFloor(+e.target.value)}
                options={floors}
              />
            </FormItem>
            <FormItem top="Выбранная переговорная" status={!room && invalid ? 'error' : undefined}>
              <Select
                placeholder="Выберите переговорную"
                value={room}
                onChange={(e) => setRoom(+e.target.value)}
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
              status={!date && invalid ? 'error' : undefined}
              disablePickers={true}
            />
          </FormItem>
          <FormLayoutGroup mode="horizontal">
            <FormItem
              top="Время начала"
              bottom={
                startTime && endTime ? `Длительность — ${(endTime - startTime) / 60000} минут` : ''
              }
              status={!startTime && invalid ? 'error' : undefined}
            >
              <Select
                placeholder="00:00"
                value={startTime}
                onChange={(e) => setStartTime(+e.target.value)}
                options={startTimes}
                disabled={tower && floor && room && date ? false : true}
              />
            </FormItem>
            <FormItem top="До" status={!endTime && invalid ? 'error' : undefined}>
              <Select
                placeholder="00:00"
                value={endTime}
                onChange={(e) => setEndTime(+e.target.value)}
                options={endTimes}
                disabled={startTime ? false : true}
              />
            </FormItem>
          </FormLayoutGroup>
          <FormItem top="Комментарий">
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
              onClick={clearData}
              disabled={
                !(date || tower || floor || room || text || startTime || endTime) ? true : false
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
