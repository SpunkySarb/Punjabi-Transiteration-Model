import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import useMessage from "antd/es/message/useMessage";
import Loading from "./Components/Loading";
import EnToPaInput from "./Components/EnToPaInput";
import './index.css';
export type ModelType = tf.LayersModel;
function App() {
  const [isLoadingModel, setModelLoadingStatus] = useState(true);
  const [model, setModel] = useState<ModelType | null>(null);
  const [messageAPI, contextHolder] = useMessage();

  const loadModel = async () => {
    const loadedModel = await tf.loadLayersModel("/model/model.json");
    return loadedModel;
  };

  useEffect(() => {
    loadModel()
      .then((model: ModelType) => {
        setModel(model);

        setModelLoadingStatus(false);
        messageAPI.success("Model Loaded Successfully...");
      })
      .catch((err) => {
        console.log(err.message);
        messageAPI.error(err.message);
      });
  }, []);

  return (
    <>
      {contextHolder}
      {isLoadingModel && <Loading />}
      {!isLoadingModel && model !== null && <EnToPaInput model={model} />}
    </>
  );
}

export default App;
