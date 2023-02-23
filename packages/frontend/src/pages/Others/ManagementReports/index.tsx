import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { FileUploadDialogButton } from '../../../components/Files/FileUploadDialogButton';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const ManagementReports = () => {
  const categoryNames = getSubCategoryData();
  const handleUpload = (result: any) => {};

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.MANAGEMENT_REPORTS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.MANAGEMENT_REPORTS} />
      {/* button to test file upload */}
      <FileUploadDialogButton
        onUpload={handleUpload}
        categoryName={categoryNames.MANAGEMENT_REPORTS}
      ></FileUploadDialogButton>
    </ProtectedContainerWrapper>
  );
};
