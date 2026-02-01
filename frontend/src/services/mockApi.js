let mockState = {
  batteryRemainingWh: 2500,
  batteryCapacityWh: 5000,
  overrideMode: false,
  lastSolarForecastWh: 300,

  devices: [
    {
      id: "1",
      name: "Security System",
      powerW: 50,
      type: "CRITICAL",
      isOn: true
    },
    {
      id: "2",
      name: "Refrigerator",
      powerW: 200,
      type: "CRITICAL",
      isOn: true
    },
    {
      id: "3",
      name: "AC Unit",
      powerW: 1500,
      type: "FLEXIBLE",
      isOn: false
    },
    {
      id: "4",
      name: "Washing Machine",
      powerW: 500,
      type: "FLEXIBLE",
      isOn: false
    },
    {
      id: "5",
      name: "Pool Pump",
      powerW: 750,
      type: "OPTIONAL",
      isOn: false
    }
  ]
};

export const getState = () =>
  new Promise(resolve => {
    setTimeout(() => {

      // simulate changes
      mockState.batteryRemainingWh =
        Math.max(0, Math.min(
          mockState.batteryCapacityWh,
          mockState.batteryRemainingWh + (Math.random() * 200 - 100)
        ));

      mockState.lastSolarForecastWh =
        100 + Math.floor(Math.random() * 400);

      resolve({ data: mockState });

    }, 300);
  });

export const toggleDevice = (id, on) => {
  const d = mockState.devices.find(x => x.id === id);
  if (d) d.isOn = on;
  return Promise.resolve();
};
export const addDevice = (device) => {
  mockState.devices.push(device);
  return Promise.resolve();
};
export const deleteDevice = (id) => {
  mockState.devices = mockState.devices.filter(d => d.id !== id);
  return Promise.resolve();
};

export const updateDevice = (updated) => {
  mockState.devices = mockState.devices.map(d =>
    d.id === updated.id ? updated : d
  );
  return Promise.resolve();
};
