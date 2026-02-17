/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

const Loading: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", padding: "3rem 1rem" }}>
      <Container>
        <SpaceBetween size="l">
          <Box fontSize="heading-xl" textAlign="center">
            Punjabi Transliteration Studio
          </Box>
          <Box textAlign="center">
            <Spinner size="large" />
          </Box>
          <Box textAlign="center">
            <StatusIndicator type="in-progress">
              Loading Punjabi model
            </StatusIndicator>
          </Box>
          <Box color="text-body-secondary" textAlign="center">
            Initializing TensorFlow.js resources.
          </Box>
        </SpaceBetween>
      </Container>
    </div>
  );
};
export default Loading;
