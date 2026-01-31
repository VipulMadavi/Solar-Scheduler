let mockState = {
  battery: 70,
  forecast: 200,
  override: false,
  devices: [
    { id: 1, name: "Pump", type: "FLEXIBLE", on: true },
    { id: 2, name: "AC", type: "OPTIONAL", on: false },
    { id: 3, name: "Server", type: "CRITICAL", on: true },
  ],
};

export const getState = () =>
  new Promise((resolve) => {
    setTimeout(() => {

      // simulate live system
      mockState.battery = Math.min(100, mockState.battery + (Math.random() * 4 - 2));
      mockState.forecast = 150 + Math.floor(Math.random() * 200);

      resolve({ data: mockState });

    }, 300);
  });

export const toggleDevice = (id, on) => {
  const d = mockState.devices.find(x => x.id === id);
  if (d) d.on = on;
  return Promise.resolve();
};
