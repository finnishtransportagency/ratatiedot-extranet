import http from 'axios';

const upload = (nodeId: string, file: File): Promise<any> => {
  let formData = new FormData();

  formData.append('file', file);

  return http.post(
    `https://api.testivaylapilvi.fi/alfresco/api/-default-/public/alfresco/versions/1/nodes/${nodeId}/children`,
    formData,
  );
};

const FileUploadService = {
  upload,
};

export default FileUploadService;
