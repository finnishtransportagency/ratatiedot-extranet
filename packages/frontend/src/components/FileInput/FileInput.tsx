import './styles.css';

interface FileInputProps {
  passFileData?: any;
}

export const FileInput = ({ passFileData }: FileInputProps) => {
  return (
    <input
      className="file-input"
      defaultValue=""
      type="file"
      onChange={(event) => {
        passFileData(event);
      }}
    />
  );
};
