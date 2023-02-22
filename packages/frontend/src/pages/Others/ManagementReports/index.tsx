import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { FileUploadDialogButton } from '../../../components/Files/FileUploadDialogButton';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const ManagementReports = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.MANAGEMENT_REPORTS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.MANAGEMENT_REPORTS} />
      {/* button to test file upload */}
      <FileUploadDialogButton categoryName={categoryNames.MANAGEMENT_REPORTS}></FileUploadDialogButton>
    </ProtectedContainerWrapper>
  );
};
