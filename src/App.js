import React from 'react';
import Form from './components/Form';

import { ConfigProvider, View, Panel } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

function App() {
  return (
    <ConfigProvider>
      <View activePanel="booking-form">
        <Panel id="booking-form">
          <Form />
        </Panel>
      </View>
    </ConfigProvider>
  );
}

export default App;
