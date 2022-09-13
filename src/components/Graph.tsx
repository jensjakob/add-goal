import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  TimeScale,
  TimeSeriesScale,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
// import { sv } from "date-fns/locale";
import "chartjs-adapter-date-fns";
import { sv } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  TimeSeriesScale,
  PointElement,
  LineElement,
  Tooltip
);

interface IXY {
  label: Date;
  value: number;
}

interface Props {
  goal?: string;
  xy?: IXY[];
}

export const Graph: React.FC<Props> = ({ goal, xy }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: false,
        },
        display: false,
        grid: {
          drawBorder: true,
          color: function (context) {
            if (context.tick.value === 0) {
              return "#000000";
            }
          },
        },
        type: "time",
        time: {
          unit: "hour",
          // Luxon format string
          tooltipFormat: "yyyy-MM-dd",
        },
        adapters: {
          date: {
            locale: sv,
          },
        },
      },
      y: {
        display: false,
      },
    },
  };

  xy?.sort((a, b) => a.label.getTime() - b.label.getTime());

  const labels = xy?.map((xy) => xy.label); // .toLocaleDateString("sv-SE"));
  const values = xy?.map((xy) => xy.value);

  const accValues = values?.map((element, index, array) => {
    // console.log(element, index, array);
    // return element;
    return (array[index] += array[index - 1] ? array[index - 1] : 0);
  });

  // console.debug("labels", labels);
  // console.debug("values", values);

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: accValues,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default Graph;
