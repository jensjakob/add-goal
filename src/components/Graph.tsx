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
    scales: {
      x: {
        display: false,
        // type: "time",
        // time: {
        //   unit: "day",
        // },
      },
      y: {
        display: false,
      },
    },
  };

  xy?.sort((a, b) => a.label.getTime() - b.label.getTime());

  const labels = xy?.map((xy) => xy.label);
  const values = xy?.map((xy) => xy.value);

  const accValues = values?.map((element, index, array) => {
    // console.log(element, index, array);
    // return element;
    return (array[index] += array[index - 1] ? array[index - 1] : 0);
  });

  console.debug("labels", labels);
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

  return (
    <div style={{ display: "inline-block", width: 120, height: 60 }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default Graph;
