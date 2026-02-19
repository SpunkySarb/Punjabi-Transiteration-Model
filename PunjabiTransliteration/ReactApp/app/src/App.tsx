import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import AppLayout from "@cloudscape-design/components/app-layout";
import Flashbar, { FlashbarProps } from "@cloudscape-design/components/flashbar";
import Loading from "./Components/Loading";
import EnToPaInput from "./Components/EnToPaInput";

export type ModelType = tf.LayersModel;

function App() {
  const [isLoadingModel, setModelLoadingStatus] = useState(true);
  const [model, setModel] = useState<ModelType | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [flashItems, setFlashItems] = useState<FlashbarProps.MessageDefinition[]>([]);

  const loadModel = async () => {
    const loadedModel = await tf.loadLayersModel("/model/model.json");
    return loadedModel;
  };

  useEffect(() => {
    loadModel()
      .then((model: ModelType) => {
        setModel(model);
        setModelLoadingStatus(false);
        setFlashItems([
          {
            type: "success",
            content: "Model Loaded Successfully...",
            dismissible: true,
            onDismiss: () => setFlashItems([]),
            id: "model-loaded",
          },
        ]);
      })
      .catch((err) => {
        console.log(err.message);
        setFlashItems([
          {
            type: "error",
            content: err.message,
            dismissible: true,
            onDismiss: () => setFlashItems([]),
            id: "model-error",
          },
        ]);
      });
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    applyMode(newMode ? Mode.Dark : Mode.Light);
  };

  return (
    <>
      <TopNavigation
        identity={{
          href: "#",
          title: "Punjabi Transliterator",
        }}
        utilities={[
          {
            type: "button",
            text: darkMode ? "Light Mode" : "Dark Mode",
            onClick: toggleDarkMode,
          },
          {
            type: "button",
            text: "GitHub",
            href: "https://github.com/SarbZone",
            external: true,
            externalIconAriaLabel: "(opens in new tab)",
          },
        ]}
      />
      <AppLayout
        navigationHide={true}
        toolsHide={true}
        notifications={<Flashbar items={flashItems} />}
        content={
          isLoadingModel ? (
            <Loading />
          ) : model !== null ? (
            <EnToPaInput model={model} />
          ) : null
        }
      />
    </>
  );
}

export default App;
