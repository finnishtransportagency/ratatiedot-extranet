import { useState } from 'react';
import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { FileUploadDialog } from '../../../components/Files/FileUploadDialog';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const ManagementReports = () => {
  const categoryNames = getSubCategoryData();
  let [dialogOpen, setDialogOpen] = useState(false);

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.MANAGEMENT_REPORTS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.MANAGEMENT_REPORTS} />
      {/* button to test file upload */}
      <button onClick={() => setDialogOpen(true)}>LATAA TIEDOSTO</button>
      {dialogOpen ? <FileUploadDialog categoryName={categoryNames.MANAGEMENT_REPORTS}></FileUploadDialog> : <></>}
    </ProtectedContainerWrapper>
  );
};
