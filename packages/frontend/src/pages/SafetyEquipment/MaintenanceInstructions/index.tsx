import { ProtectedContainerWrapper } from '../../../styles/common';

export const MaintenanceInstructions = () => {
  const { VITE_MAINTENANCE_INSTRUCTIONS_NODE_ID, VITE_ALFRESCO_DOWNLOAD_URL } = import.meta.env;

  return (
    <ProtectedContainerWrapper>
      <div style={{ width: '100%', height: '600px', margin: '20px 0' }}>
        <iframe
          src={`${VITE_ALFRESCO_DOWNLOAD_URL}/alfresco/versions/1/nodes/${VITE_MAINTENANCE_INSTRUCTIONS_NODE_ID}/content?attachment=false`}
          title="Testi PDF"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allow="fullscreen"
        />
      </div>
    </ProtectedContainerWrapper>
  );
};
