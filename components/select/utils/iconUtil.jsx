import SearchOutlined from '@ant-design/icons-vue/SearchOutlined';
import CloseOutlined from '@ant-design/icons-vue/CloseOutlined';
import CloseCircleFilled from '@ant-design/icons-vue/CloseCircleFilled';
import CheckOutlined from '@ant-design/icons-vue/CheckOutlined';
import DownOutlined from '@ant-design/icons-vue/DownOutlined';
import LoadingOutlined from '@ant-design/icons-vue/LoadingOutlined';

export default function getIcons({
  h,
  suffixIcon,
  clearIcon,
  menuItemSelectedIcon,
  removeIcon,
  loading,
  multiple,
}) {
  // Clear Icon
  let mergedClearIcon = clearIcon;
  if (!clearIcon) {
    mergedClearIcon = h => <CloseCircleFilled />;
  }

  // Arrow item icon
  let mergedSuffixIcon = null;
  if (suffixIcon !== undefined) {
    mergedSuffixIcon = suffixIcon;
  } else if (loading) {
    mergedSuffixIcon = <LoadingOutlined spin />;
  } else {
    mergedSuffixIcon = ({ open, showSearch }) => {
      if (open && showSearch) {
        return <SearchOutlined />;
      }
      return <DownOutlined />;
    };
  }

  // Checked item icon
  let mergedItemIcon = null;
  if (menuItemSelectedIcon !== undefined) {
    mergedItemIcon = menuItemSelectedIcon;
  } else if (multiple) {
    mergedItemIcon = <CheckOutlined />;
  } else {
    mergedItemIcon = null;
  }

  let mergedRemoveIcon = null;
  if (removeIcon !== undefined) {
    mergedRemoveIcon = removeIcon;
  } else {
    mergedRemoveIcon = <CloseOutlined />;
  }

  return {
    clearIcon: mergedClearIcon,
    suffixIcon: mergedSuffixIcon,
    itemIcon: mergedItemIcon,
    removeIcon: mergedRemoveIcon,
  };
}
