const { SerialPort, ReadlineParser } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyACM0",
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

parser.on("data", (data) => {
  const line = data.split(",");

  console.log(line[0], "dan", line[1]);
});
