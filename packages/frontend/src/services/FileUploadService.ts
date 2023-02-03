import http from 'axios';

const upload = (nodeId: string, file: File): Promise<any> => {
  let formData = new FormData();

  formData.append('file', file);

  return http.post(`http://localhost:3004/api/alfresco/file/hallintaraportit`, formData);
};

const FileUploadService = {
  upload,
};

export default FileUploadService;
