<template>
  <div class="app-container">
    <div class="form__design">
      <div class="form__design__left">
        <el-upload
          drag
          action="#"
          accept=".xlsx"
          class="form__design__left__upload"
          :show-file-list="false"
          :multiple="false"
          :auto-upload="false"
          :on-change="onChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
            ，只支持xlsx格式
          </div>
        </el-upload>

        <div id="luckysheet" class="form__design__left__excel"></div>
      </div>
      <div class="form__design__right">
        <el-form
          ref="cfgFormRef"
          class="form__design__right__form"
          :model="cfgForm.form"
          :rules="cfgForm.rules"
          label-position="top"
          style="height: 100%"
        >
          <el-form-item prop="name">
            <template #label>
              <span class="form__design__right__label">名称配置</span>
            </template>
            <el-input
              v-model="cfgForm.form.name"
              placeholder="请输入"
              :disabled="!cfgForm.form.fieldList0?.length"
            />
          </el-form-item>
          <el-form-item prop="type">
            <template #label>
              <span class="form__design__right__label">类型配置</span>
            </template>
            <el-select
              style="width: 100%"
              v-model="cfgForm.form.type"
              :disabled="!cfgForm.form.fieldList0?.length"
            >
              <el-option label="日报" value="1" />
              <el-option label="周报" value="2" />
              <el-option label="月报" value="3" />
              <el-option label="季报" value="4" />
              <el-option label="年报" value="5" />
              <el-option label="其他" value="6" />
            </el-select>
          </el-form-item>
          <el-form-item prop="fieldList" class="form__design__right__field">
            <template #label>
              <span class="form__design__right__label">字段配置</span>
              <el-button
                type="primary"
                link
                icon="Setting"
                class="form__design__right__field__opr"
                @click="batchSettingClick"
                :disabled="!fieldMultipleSelection?.length"
              >
                批量设置
              </el-button>
            </template>
            <el-collapse
              class="form__design__right__field__collapse"
              accordion
              v-model="curSheetIndex"
              @change="handleCollapseChange"
            >
              <el-collapse-item v-for="(sheet, index) in sheets" :title="sheet.name" :name="index">
                <el-table
                  v-if="curSheetIndex === index"
                  ref="fieldTableRef"
                  :data="cfgForm.form[`fieldList${curSheetIndex}`]"
                  :row-class-name="({ row }) => `cell_${index}_${row.columnNum}`"
                  row-key="columnNum"
                  highlight-current-row
                  style="width: 100%; height: 100%"
                  @select="fieldCfgTableSelect"
                  @select-all="fieldCfgTableSelect"
                >
                  <el-table-column type="selection" width="30" align="center" />
                  <!--                  <el-table-column type="index" label="序号" width="55" align="center" />-->
                  <el-table-column label="单元格" prop="cellName" width="70" align="center">
                    <template #default="scope">
                      <span :id="`cell_${curSheetIndex}_${scope.row.columnNum}`">
                        {{ scope.row.cellName }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="数据源" prop="dataSource" align="center">
                    <template #default="scope">
                      <el-select
                        style="width: 100%"
                        v-model="scope.row.dataSource"
                        :disabled="
                          fieldMultipleSelection?.every(
                            (row) => row.columnNum !== scope.row.columnNum
                          )
                        "
                      >
                        <el-option label="用户输入" :value="scope.row.name" />
                        <el-option label="系统部门" value="deptName" />
                        <el-option label="系统用户" value="userName" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="是否支持汇总"
                    prop="isSupportSum"
                    align="center"
                    width="112"
                  >
                    <template #default="scope">
                      <el-switch
                        v-model="scope.row.isSupportSum"
                        :disabled="
                          fieldMultipleSelection?.every(
                            (row) => row.columnNum !== scope.row.columnNum
                          )
                        "
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </el-form-item>
        </el-form>
        <section class="form__design__right__footer">
          <el-button
            size="large"
            type="primary"
            icon="Select"
            style="width: 100%"
            :disabled="!cfgForm.form.fieldList0?.length"
            @click="saveCfg"
          >
            保存为草稿
          </el-button>
        </section>
      </div>
    </div>
    <el-dialog v-model="settingDialogVisible" title="批量设置" width="400px" align-center draggable>
      <el-form ref="settingFormRef" :model="settingForm" label-position="top">
        <el-form-item prop="dataSource" label="数据源">
          <el-select style="width: 100%" v-model="settingForm.dataSource">
            <el-option label="用户输入" value="" />
            <el-option label="系统部门" value="deptName" />
            <el-option label="系统用户" value="userName" />
          </el-select>
        </el-form-item>
        <el-form-item prop="isSupportSum" label="是否支持汇总">
          <el-switch v-model="settingForm.isSupportSum" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="settingOkClick">确 认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import LuckyExcel from 'luckyexcel';
import { ref } from 'vue';

const fieldTableRef = ref(null);
const cfgFormRef = ref(null);
const curSheetIndex = ref(0);
const sheets = ref([]);
const settingDialogVisible = ref(false);
const settingFormRef = ref(null);
const settingForm = ref({
  dataSource: '',
  isSupportSum: false
});
const cfgForm = reactive({
  form: {
    type: '',
    name: ''
  },
  rules: {
    type: [{ required: true, message: '类型配置不能为空！' }],
    name: [{ required: true, message: '名称配置不能为空！' }]
  },
  fieldRowIndex: null
});
const fieldMultipleSelection = computed(() => fieldTableRef.value?.[0]?.getSelectionRows() || []);
const options = {
  container: 'luckysheet',
  lang: 'zh',
  showtoolbar: true, //是否显示工具栏
  showinfobar: false, //是否显示顶部信息栏
  allowCopy: false, //是否允许拷贝
  showConfigWindowResize: false, //图表或数据透视表的配置会在右侧弹出，设置弹出后表格是否会自动缩进
  showtoolbarConfig: {
    undoRedo: true, //撤销重做，注意撤消重做是两个按钮，由这一个配置决定显示还是隐藏
    paintFormat: false, //格式刷
    currencyFormat: true, //货币格式
    percentageFormat: true, //百分比格式
    numberDecrease: true, // '减少小数位数'
    numberIncrease: true, // '增加小数位数
    moreFormats: true, // '更多格式'
    font: false, // '字体'
    fontSize: false, // '字号大小'
    bold: false, // '粗体 (Ctrl+B)'
    italic: false, // '斜体 (Ctrl+I)'
    strikethrough: false, // '删除线 (Alt+Shift+5)'
    underline: false, // '下划线 (Alt+Shift+6)'
    textColor: false, // '文本颜色'
    fillColor: false, // '单元格颜色'
    border: false, // '边框'
    mergeCell: false, // '合并单元格'
    horizontalAlignMode: false, // '水平对齐方式'
    verticalAlignMode: false, // '垂直对齐方式'
    textWrapMode: false, // '换行方式'
    textRotateMode: false, // '文本旋转方式'
    image: false, // '插入图片'
    link: false, // '插入链接'
    chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
    postil: false, //'批注'
    pivotTable: false, //'数据透视表'
    function: false, // '公式'
    frozenMode: false, // '冻结方式'
    sortAndFilter: false, // '排序和筛选'
    conditionalFormat: false, // '条件格式'
    dataVerification: true, // '数据验证'
    splitColumn: false, // '分列'
    screenshot: false, // '截图'
    findAndReplace: false, // '查找替换'
    protection: false, // '工作表保护'
    print: false // '打印'
  },
  showsheetbar: true, //是否显示底部sheet页按钮
  showsheetbarConfig: {
    add: false,
    menu: false
  },
  showstatisticBar: true, //是否显示底部计数栏
  showstatisticBarConfig: {
    count: false, // 计数栏
    view: true, // 打印视图
    zoom: true // 缩放
  },
  sheetRightClickConfig: {
    delete: false, // 删除
    copy: false, // 复制
    rename: false, //重命名
    color: false, //更改颜色
    hide: false, //隐藏，取消隐藏
    move: false //向左移，向右移
  },
  cellRightClickConfig: {
    copy: false, // 复制
    copyAs: false, // 复制为
    paste: false, // 粘贴
    insertRow: false, // 插入行
    insertColumn: false, // 插入列
    deleteRow: false, // 删除选中行
    deleteColumn: false, // 删除选中列
    deleteCell: false, // 删除单元格
    hideRow: false, // 隐藏选中行和显示选中行
    hideColumn: false, // 隐藏选中列和显示选中列
    rowHeight: false, // 行高
    columnWidth: false, // 列宽
    clear: false, // 清除内容
    matrix: false, // 矩阵操作选区
    sort: false, // 排序选区
    filter: false, // 筛选选区
    chart: false, // 图表生成
    image: false, // 插入图片
    link: false, // 插入链接
    data: false, // 数据验证
    cellFormat: false // 设置单元格格式
  },
  allowEdit: true,
  sheetFormulaBar: false, //是否显示公示栏
  enableAddRow: false, //是否允许添加行
  enableAddBackTop: false, //是否允需回到顶部
  config: {},
  hook: {
    cellUpdateBefore(r, c) {
      // 不能修改内容
      return false;
    },
    cellMousedownBefore(cell, position) {
      return position.r === cfgForm.fieldRowIndex;
    },
    rangeSelect: (sheet, range) => {
      setTimeout(() => {
        const fieldRange = range.filter(
          (item) => item.row[0] === cfgForm.fieldRowIndex && item.row[1] === cfgForm.fieldRowIndex
        );
        const selectedColumnList = fieldRange
          .map((item) =>
            new Array(item.column[1] - item.column[0] + 1)
              .fill('')
              .map((_, i) => item.column[0] + i)
          )
          .flat();
        const selection = cfgForm.form[`fieldList${curSheetIndex.value}`]?.filter((row) =>
          selectedColumnList.includes(row.columnNum)
        );
        if (!fieldCfgTableRowsCompare(selection, fieldMultipleSelection.value)) {
          cfgForm.form[`fieldList${curSheetIndex.value}`]?.forEach((row) => {
            fieldTableRef.value[0]?.toggleRowSelection(
              row,
              selectedColumnList.includes(row.columnNum)
            );
          });
          if (fieldRange.length) {
            tableScrollToRow(fieldRange[fieldRange.length - 1].column[1]);
          }
        }
      });
    },

    // 激活工作表前
    sheetActivate: (sheetIndex) => {
      const sheetFile = luckysheet.getLuckysheetfile();
      curSheetIndex.value = +sheetFile.find((item) => +item.index === +sheetIndex).order;
    },
    workbookCreateAfter: (opts) => {
      setFieldList();
      sheets.value = luckysheet.getLuckysheetfile().map((item) => ({
        name: item.name
      }));
      // 设置默认状态
      curSheetIndex.value = 0;
      luckysheet.setSheetActive(curSheetIndex.value);
      setRangeDefault();
    }
  }
};

function setRangeDefault() {
  nextTick(() => {
    nextTick(() => {
      luckysheet.setRangeShow({
        row: [cfgForm.fieldRowIndex, cfgForm.fieldRowIndex],
        column: [0, 0]
      });
    });
  });
}

function fieldCfgTableRowsCompare(newRows, oldRows) {
  return (
    newRows?.length === oldRows?.length &&
    newRows.every((row) => oldRows.some((oldRow) => oldRow.columnNum === row.columnNum))
  );
}

/**
 *  el-table滚动到表格某一行
 */
function tableScrollToRow(rowIndex) {
  document.getElementsByClassName(`cell_${curSheetIndex.value}_${rowIndex}`)?.[0]?.scrollIntoView({
    block: 'center',
    behavior: 'smooth'
  });
}

function columnIndex2Name(cIndex = 0) {
  const arr = new Array(26).fill('').map((_, i) => String.fromCharCode(65 + i));
  const n = Math.floor(cIndex / arr.length) - 1;
  const y = cIndex % arr.length;
  return `${arr[n] || ''}${arr[y]}`;
}

function setFieldList() {
  luckysheet.getLuckysheetfile().forEach((sheet, i) => {
    cfgForm.form[`fieldList${i}`] = sheet.data?.[sheet.row]
      ?.filter((row) => !!row)
      .map((row, index) => {
        return {
          columnNum: index,
          cellName: columnIndex2Name(index) + (sheet.row + 1),
          name: `c${index + 1}`,
          dataSource: `c${index + 1}`,
          isSupportSum: false
        };
      });
  });
  console.log(cfgForm, 'cfgForm');
}

const setSheetEffectRC = (sheets = []) => {
  sheets.forEach((sheet) => {
    const rowIndexList = sheet.celldata.map((item) => item.r);
    const columnIndexList = sheet.celldata.map((item) => item.c);
    rowIndexList.sort();
    columnIndexList.sort();
    sheet.row = rowIndexList.pop();
    sheet.column = columnIndexList.pop();
  });
};
const onChange = (file) => {
  LuckyExcel.transformExcelToLucky(file.raw, (exportJson, luckysheetfile) => {
    if (exportJson.sheets == null || exportJson.sheets.length == 0) {
      ElMessage.error('读取excel文件内容失败，暂不支持xls文件!');
      return;
    }
    console.log(exportJson, 'exportJson');
    luckysheet.destroy();
    setSheetEffectRC(exportJson.sheets);
    // 主sheet页的数据表最后一行
    cfgForm.fieldRowIndex = exportJson.sheets[0].row;
    cfgForm.form.name = exportJson.info.name.replace('.xlsx', '');

    luckysheet.create({
      //配置项
      ...options,
      data: exportJson.sheets,
      title: exportJson.info.name
    });
  });
};

const fieldCfgTableSelect = (selection, row) => {
  console.log(selection, row, 'fieldCfgTableSelect');
  selection.sort((a, b) => a.columnNum - b.columnNum);
  const locationColumn =
    row && selection.some((item) => item.columnNum === row.columnNum) ? row.columnNum : 0;
  fieldCfgTableSelectionChange(selection, locationColumn);
};

const fieldCfgTableSelectionChange = (selection, locationColumn) => {
  const val = selection;
  if (val.length) {
    // 滚动定位到最小列
    const scrollToColumn = locationColumn - 4;
    luckysheet.scroll({
      targetColumn: scrollToColumn < 0 ? 0 : scrollToColumn
    });
    // 设置选区
    luckysheet.setRangeShow(
      val.map((row) => ({
        row: [cfgForm.fieldRowIndex, cfgForm.fieldRowIndex],
        column: [row.columnNum, row.columnNum]
      }))
    );
  } else {
    setRangeDefault();
  }
};

const batchSettingClick = () => {
  settingDialogVisible.value = true;
  settingFormRef.value.resetFields();
};
const settingOkClick = () => {
  const rows = fieldMultipleSelection.value;
  rows.forEach((row) => {
    row.isSupportSum = settingForm.value.isSupportSum;
    row.dataSource = settingForm.value.dataSource ? settingForm.value.dataSource : row.name;
  });
  settingDialogVisible.value = false;
};

const saveCfg = () => {
  cfgFormRef.value?.validate((valid) => {
    if (valid) {
      const reqData = {
        type: cfgForm.form.type,
        name: cfgForm.form.name,
        status: 1,
        excelJson: JSON.stringify(luckysheet.toJson()),
        sheets: JSON.stringify(
          luckysheet.getLuckysheetfile().map((sheet) => ({
            index: sheet.index,
            order: sheet.order,
            rowIndex: sheet.row,
            fieldList: cfgForm.form[`fieldList${sheet.order}`]
          }))
        )
      };
      console.log(reqData, 'saveCfg');
    }
  });
};

const handleCollapseChange = () => {
  // 切换sheet页
  luckysheet.setSheetActive(curSheetIndex.value);
};

watch(
  () => curSheetIndex.value,
  (curIndex) => {
    cfgForm.fieldRowIndex = luckysheet.getLuckysheetfile()?.[+curIndex].row;
    setRangeDefault();
  }
);
</script>

<style lang="scss" scoped>
.form__design {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 20px;
  &__left {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 20px;
    &__upload {
      &:deep(.el-upload) {
        --el-upload-dragger-padding-horizontal: 12px;
      }
    }
    &__excel {
      flex: 1;
      overflow: hidden;
    }
  }
  &__right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 350px;
    &__footer {
      width: 100%;
    }
    &__form {
      flex: 1;
      overflow: hidden;
    }
    &__label {
      font-weight: 400;
      color: var(--el-color-primary);
    }
    &__field__opr {
      position: absolute;
      right: 0;
      top: 0;
    }
    &__field {
      &__collapse {
        width: 100%;
        height: 100%;
        padding-left: 8px;
        display: flex;
        flex-direction: column;
        &:deep(.el-collapse-item.is-active) {
          flex: 1;
          overflow: hidden;
          min-height: 48px;
          display: flex;
          flex-direction: column;
          .el-collapse-item__wrap {
            flex: 1;
            overflow: hidden;
            .el-collapse-item__content {
              height: 100%;
            }
          }
        }
      }
    }
    &:deep(.el-form) {
      display: flex;
      flex-direction: column;

      .form__design__right__field {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        margin-bottom: 0;
        .el-form-item__label {
          position: relative;
        }
        .el-form-item__content {
          flex: 1;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
