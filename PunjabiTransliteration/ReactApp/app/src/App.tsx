import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Loading from "./Components/Loading";
import EnToPaInput from "./Components/EnToPaInput";
import "./index.css";

export type ModelType = tf.LayersModel;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to load transliteration model.";
};

function App() {
  const [isLoadingModel, setModelLoadingStatus] = useState(true);
  const [model, setModel] = useState<ModelType | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelLoadedAt, setModelLoadedAt] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel("/model/model.json");
        if (!isMounted) {
          return;
        }
        setModel(loadedModel);
        setModelLoadedAt(new Date().toLocaleString());
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setModelError(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setModelLoadingStatus(false);
        }
      }
    };

    void loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoadingModel) {
    return <Loading />;
  }

  if (modelError !== null || model === null) {
    return (
      <div style={{ minHeight: "100vh", padding: "3rem 1rem" }}>
        <Container
          header={<Box fontSize="heading-xl">Model initialization failed</Box>}
        >
          <SpaceBetween size="m">
            <Alert type="error" header="The model could not be loaded">
              {modelError ?? "Model is unavailable."}
            </Alert>
            <Box color="text-body-secondary">
              Verify that `/public/model/model.json` and related shard files are
              available, then retry.
            </Box>
            <Box>
              <Button
                variant="primary"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Retry model load
              </Button>
            </Box>
          </SpaceBetween>
        </Container>
      </div>
    );
  }

  return (
    <EnToPaInput model={model} modelLoadedAt={modelLoadedAt} />
  );
}

export default App;
