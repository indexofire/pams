<template>
  <div class="strains-container">
    <div class="page-header">
      <h1>菌株管理</h1>
      <p>管理和查看菌株信息</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button
          type="primary"
          @click="addStrain"
          v-if="canUpload"
        >
          <font-awesome-icon icon="plus" style="margin-right: 5px;" />
          添加菌株
        </el-button>
        <el-button
          type="success"
          @click="importStrains"
          v-if="canUpload"
        >
          <font-awesome-icon icon="upload" style="margin-right: 5px;" />
          导入菌株
        </el-button>
        <el-button type="warning" @click="exportStrains">
          <font-awesome-icon icon="download" style="margin-right: 5px;" />
          导出菌株
        </el-button>
        <el-button
          type="danger"
          @click="batchDelete"
          v-if="canUpload && selectedStrains.length > 0"
        >
          <font-awesome-icon icon="trash" style="margin-right: 5px;" />
          批量删除 ({{ selectedStrains.length }})
        </el-button>
      </div>

      <div class="filter-section">
        <!-- 快速搜索 -->
        <div class="quick-search">
          <el-input
            v-model="quickSearchText"
            placeholder="快速搜索菌株编号、样本编号..."
            clearable
            @input="handleQuickSearch"
            class="quick-search-input"
          >
            <template #prefix>
              <font-awesome-icon icon="search" style="color: #909399; margin-left: 8px;" />
            </template>
          </el-input>
        </div>

        <el-divider />

        <el-form :inline="true" :model="filterForm">
          <el-form-item label="菌株编号">
            <el-input
              v-model="filterForm.strain_id"
              placeholder="请输入菌株编号"
              clearable
            />
          </el-form-item>
          <el-form-item label="菌种（属）">
            <el-select
              v-model="filterForm.species"
              placeholder="请选择菌种"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in speciesOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="地区">
            <el-select
              v-model="filterForm.region"
              placeholder="请选择地区"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in regionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="样本来源">
            <el-select
              v-model="filterForm.sample_source"
              placeholder="请选择样本来源"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in sourceOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="实验类型">
            <el-select
              v-model="filterForm.experiment_type"
              placeholder="请选择实验类型"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in experimentTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="来源">
            <el-select
              v-model="filterForm.project_source"
              placeholder="请选择来源"
              clearable
            >
              <el-option
                v-for="option in projectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchStrains">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="paginatedStrains"
          v-loading="loading"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          empty-text="暂无菌株数据"
          :default-sort="{ prop: 'id', order: 'ascending' }"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="(row) => canUpload"
          />
          <el-table-column prop="sequence_number" label="序号" width="80" align="center" sortable="custom">
            <template #default="scope">
              <span class="sequence-number">
                {{ scope.row.sequence_number || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="strain_id" label="菌株编号" width="140" sortable="custom">
            <template #default="scope">
              <div class="strain-id-cell">
                <div class="strain-id-content">
                  <el-icon class="strain-icon"><Document /></el-icon>
                  <span class="strain-text">{{ scope.row.strain_id }}</span>
                </div>
                <el-tooltip
                  v-if="scope.row.notes || scope.row.description"
                  :content="scope.row.notes || scope.row.description"
                  placement="top"
                >
                  <el-icon class="notes-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="species" label="菌种（属）" width="120" sortable="custom" />
          <el-table-column prop="sample_id" label="样本编号" width="120" sortable="custom" />
          <el-table-column prop="sample_source" label="样本" width="100" sortable="custom" />
          <el-table-column prop="region" label="地区" width="100" sortable="custom">
            <template #default="scope">
              <div style="display: flex; align-items: center;">
                <el-icon style="margin-right: 4px; color: #67C23A;"><Location /></el-icon>
                <span>{{ scope.row.region || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="project_source" label="来源" width="100" sortable="custom" />
          <el-table-column label="日期" width="120" align="center">
            <template #default="scope">
              <div class="date-icons">
                <!-- 发病日期 -->
                <el-tooltip
                  :content="scope.row.onset_date ? `发病日期: ${formatDate(scope.row.onset_date)}` : '无发病日期'"
                  placement="top"
                >
                  <font-awesome-icon
                    icon="pills"
                    :style="{
                      color: scope.row.onset_date ? '#E74C3C' : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="date-icon"
                    :class="{ 'date-icon-empty': !scope.row.onset_date }"
                  />
                </el-tooltip>

                <!-- 采样日期 -->
                <el-tooltip
                  :content="scope.row.sampling_date ? `采样日期: ${formatDate(scope.row.sampling_date)}` : '无采样日期'"
                  placement="top"
                >
                  <font-awesome-icon
                    icon="vial"
                    :style="{
                      color: scope.row.sampling_date ? '#3498DB' : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="date-icon"
                    :class="{ 'date-icon-empty': !scope.row.sampling_date }"
                  />
                </el-tooltip>

                <!-- 分离日期 -->
                <el-tooltip
                  :content="scope.row.isolation_date ? `分离日期: ${formatDate(scope.row.isolation_date)}` : '无分离日期'"
                  placement="top"
                >
                  <font-awesome-icon
                    icon="microscope"
                    :style="{
                      color: scope.row.isolation_date ? '#E6A23C' : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="date-icon"
                    :class="{ 'date-icon-empty': !scope.row.isolation_date }"
                  />
                </el-tooltip>

                <!-- 上送日期 -->
                <el-tooltip
                  :content="scope.row.submission_date ? `上送日期: ${formatDate(scope.row.submission_date)}` : '无上送日期'"
                  placement="top"
                >
                  <font-awesome-icon
                    icon="hospital"
                    :style="{
                      color: scope.row.submission_date ? '#27AE60' : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="date-icon"
                    :class="{ 'date-icon-empty': !scope.row.submission_date }"
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="样本信息图标" width="140" align="center">
            <template #default="scope">
              <div class="patient-info-icons">
                <!-- 姓名 -->
                <el-tooltip
                  :content="scope.row.patient_name ? `姓名: ${scope.row.patient_name}` : '无姓名信息'"
                  placement="top"
                >
                  <font-awesome-icon
                    icon="user"
                    :style="{
                      color: scope.row.patient_name ? '#409EFF' : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="patient-info-icon"
                    :class="{ 'patient-info-icon-empty': !scope.row.patient_name }"
                  />
                </el-tooltip>

                <!-- 性别 -->
                <el-tooltip
                  :content="scope.row.patient_gender ? `性别: ${scope.row.patient_gender}` : '无性别信息'"
                  placement="top"
                >
                  <font-awesome-icon
                    :icon="getFontAwesomeGenderIcon(scope.row.patient_gender)"
                    :style="{
                      color: scope.row.patient_gender ? getGenderColor(scope.row.patient_gender) : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="patient-info-icon"
                    :class="{ 'patient-info-icon-empty': !scope.row.patient_gender }"
                  />
                </el-tooltip>

                <!-- 年龄 -->
                <el-tooltip
                  :content="scope.row.patient_age ? `年龄: ${scope.row.patient_age}岁` : '无年龄信息'"
                  placement="top"
                >
                  <font-awesome-icon
                    icon="baby"
                    :style="{
                      color: scope.row.patient_age ? '#E6A23C' : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="patient-info-icon"
                    :class="{ 'patient-info-icon-empty': !scope.row.patient_age }"
                  />
                </el-tooltip>

                <!-- 身份证号 -->
                <el-tooltip
                  :content="scope.row.patient_id_number ? `身份证号: ${scope.row.patient_id_number}` : '无身份证号信息'"
                  placement="top"
                >
                  <font-awesome-icon
                    icon="id-card"
                    :style="{
                      color: scope.row.patient_id_number ? '#67C23A' : '#C0C4CC',
                      fontSize: '18px'
                    }"
                    class="patient-info-icon"
                    :class="{ 'patient-info-icon-empty': !scope.row.patient_id_number }"
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上传信息" width="140" align="center">
            <template #default="scope">
              <div class="upload-info-icons">
                <!-- 上传用户 -->
                <el-tooltip
                  :content="scope.row.uploaded_by ? `上传用户: ${scope.row.uploaded_by}` : '无上传用户信息'"
                  placement="top"
                >
                  <el-icon
                    :style="{
                      color: scope.row.uploaded_by ? '#409EFF' : '#C0C4CC',
                      fontSize: '18px',
                      margin: '0 4px'
                    }"
                    class="upload-info-icon"
                    :class="{ 'upload-info-icon-empty': !scope.row.uploaded_by }"
                  >
                    <User />
                  </el-icon>
                </el-tooltip>

                <!-- 创建时间 -->
                <el-tooltip
                  :content="scope.row.created_at ? `创建时间: ${formatDateTime(scope.row.created_at)}` : '无创建时间信息'"
                  placement="top"
                >
                  <el-icon
                    :style="{
                      color: scope.row.created_at ? '#67C23A' : '#C0C4CC',
                      fontSize: '18px',
                      margin: '0 4px'
                    }"
                    class="upload-info-icon"
                    :class="{ 'upload-info-icon-empty': !scope.row.created_at }"
                  >
                    <Clock />
                  </el-icon>
                </el-tooltip>

                <!-- 更新时间 -->
                <el-tooltip
                  :content="scope.row.updated_at ? `更新时间: ${formatDateTime(scope.row.updated_at)}` : '无更新时间信息'"
                  placement="top"
                >
                  <el-icon
                    :style="{
                      color: scope.row.updated_at ? '#E6A23C' : '#C0C4CC',
                      fontSize: '18px',
                      margin: '0 4px'
                    }"
                    class="upload-info-icon"
                    :class="{ 'upload-info-icon-empty': !scope.row.updated_at }"
                  >
                    <Timer />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <el-tooltip content="查看菌株详情" placement="top">
                  <el-button
                    size="small"
                    @click="viewStrain(scope.row)"
                    circle
                  >
                    <el-icon><Document /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="编辑菌株信息" placement="top" v-if="canUpload">
                  <el-button
                    size="small"
                    type="warning"
                    @click="editStrain(scope.row)"
                    circle
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除菌株" placement="top" v-if="canUpload">
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteStrain(scope.row)"
                    circle
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[20, 50, 100, 200, 500]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 文件导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入菌株数据"
      width="800px"
    >
      <div class="import-steps">
        <el-steps :active="importStep" finish-status="success">
          <el-step title="选择文件" description="支持xlsx、csv、tsv格式"></el-step>
          <el-step title="字段映射" description="设置文件字段对应关系"></el-step>
          <el-step title="数据验证" description="验证数据格式和安全性"></el-step>
          <el-step title="导入完成" description="导入菌株数据"></el-step>
        </el-steps>
      </div>

      <!-- 第一步：选择文件 -->
      <div v-if="importStep === 0" class="import-step-content">
        <div class="file-upload-area">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".xlsx,.csv,.tsv"
            drag
          >
            <div class="upload-content">
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击选择文件</em>
              </div>
              <div class="el-upload__tip">
                支持 Excel (.xlsx)、CSV (.csv) 和 TSV (.tsv) 格式
              </div>
            </div>
          </el-upload>
          <div v-if="selectedFile" class="selected-file">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span>{{ selectedFile.name }}</span>
              <el-button text @click="clearFile">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二步：字段映射 -->
      <div v-if="importStep === 1" class="import-step-content">
        <div class="field-mapping">
          <h4>字段映射设置</h4>
          <p>请设置文件中的字段与系统字段的对应关系：</p>
          <el-table :data="fieldMappingData" border>
            <el-table-column prop="systemField" label="系统字段" width="150">
              <template #default="scope">
                <strong>{{ scope.row.systemFieldLabel }}</strong>
                <span v-if="scope.row.required" class="required">*</span>
              </template>
            </el-table-column>
            <el-table-column label="文件字段" width="200">
              <template #default="scope">
                <el-select
                  v-model="scope.row.fileField"
                  placeholder="请选择文件字段"
                  clearable
                >
                  <el-option
                    v-for="field in fileFields"
                    :key="field"
                    :label="field"
                    :value="field"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
        </div>
      </div>

      <!-- 第三步：数据验证 -->
      <div v-if="importStep === 2" class="import-step-content">
        <div class="data-validation">
          <h4>数据验证结果</h4>
          <div class="validation-summary">
            <div class="summary-item">
              <span class="label">总记录数：</span>
              <span class="value">{{ importData.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">有效记录：</span>
              <span class="value success">{{ validRecords.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">错误记录：</span>
              <span class="value error">{{ errorRecords.length }}</span>
            </div>
          </div>

          <div v-if="errorRecords.length > 0" class="error-list">
            <h5>错误记录详情：</h5>
            <el-table :data="errorRecords" border max-height="300">
              <el-table-column prop="rowIndex" label="行号" width="80" />
              <el-table-column prop="field" label="字段" width="120" />
              <el-table-column prop="value" label="值" width="120" />
              <el-table-column prop="error" label="错误信息" />
            </el-table>
          </div>
        </div>
      </div>

      <!-- 第四步：导入完成 -->
      <div v-if="importStep === 3" class="import-step-content">
        <div class="import-result">
          <!-- 导入进行中 -->
          <div v-if="isImporting" class="importing-status">
            <div class="progress-icon">
              <el-icon size="60" color="#409EFF" class="rotating"><Loading /></el-icon>
            </div>
            <h4>正在导入数据...</h4>
            <div class="progress-container">
              <el-progress
                :percentage="importProgress"
                :stroke-width="8"
                :show-text="true"
                :format="(percentage) => `${percentage}%`"
              />
              <p class="progress-text">已处理 {{ Math.round(validRecords.length * importProgress / 100) }} / {{ validRecords.length }} 条记录</p>
            </div>
          </div>

          <!-- 导入完成 -->
          <div v-else class="import-completed">
            <div class="result-icon">
              <el-icon size="60" color="#67c23a"><CircleCheck /></el-icon>
            </div>
            <h4>导入完成</h4>
            <p>成功导入 {{ importedCount }} 条菌株记录</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="import-dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button v-if="importStep > 0" @click="prevStep">上一步</el-button>
          <el-button
            v-if="importStep < 3"
            type="primary"
            @click="nextStep"
            :disabled="!canNextStep"
          >
            {{ importStep === 2 ? '开始导入' : '下一步' }}
          </el-button>
          <el-button
            v-if="importStep === 3"
            type="primary"
            @click="finishImport"
          >
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出菌株数据"
      width="400px"
    >
      <div>
        <p style="margin-bottom: 20px; color: #606266;">
          已选择 {{ selectedStrains.length }} 条菌株数据，请选择导出格式：
        </p>

        <el-radio-group v-model="exportFormat" style="display: flex; flex-direction: column; gap: 10px;">
          <el-radio value="xlsx">
            <span style="font-weight: 500;">Excel 格式 (.xlsx)</span>
            <br>
            <span style="color: #909399; font-size: 12px; margin-left: 20px;">
              推荐格式，支持复杂格式和公式
            </span>
          </el-radio>
          <el-radio value="csv">
            <span style="font-weight: 500;">CSV 格式 (.csv)</span>
            <br>
            <span style="color: #909399; font-size: 12px; margin-left: 20px;">
              通用格式，兼容性好
            </span>
          </el-radio>
          <el-radio value="tsv">
            <span style="font-weight: 500;">TSV 格式 (.tsv)</span>
            <br>
            <span style="color: #909399; font-size: 12px; margin-left: 20px;">
              制表符分隔，适合数据分析
            </span>
          </el-radio>
        </el-radio-group>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="exportLoading"
            @click="performExport"
          >
            {{ exportLoading ? '导出中...' : '确定导出' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 菌株详情/编辑对话框 -->
    <el-dialog
      v-model="strainDialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="closeDialog"
    >
      <el-tabs v-model="activeTab" type="card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="basicFormRef"
            :model="strainForm.basic"
            :rules="basicFormRules"
            label-width="120px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="strain_id">
                  <template #label>
                    <span>
                      <el-icon><Document /></el-icon>
                      菌株编号
                      <el-tooltip content="唯一标识菌株的编号，3-50个字符，只能包含数字、字母、下划线和连字符" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input
                    v-model="strainForm.basic.strain_id"
                    placeholder="请输入菌株编号"
                    :disabled="!isEditMode"
                    prefix-icon="Document"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="菌种（属）" prop="species">
                  <DropdownInput
                    v-model="strainForm.basic.species"
                    :options="speciesOptions"
                    placeholder="请选择或输入菌种"
                    :disabled="!isEditMode"
                    @change="handleSpeciesChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="sample_id">
                  <template #label>
                    <span>
                      <el-icon><Files /></el-icon>
                      样本编号
                      <el-tooltip content="样本的唯一编号，可以用逗号分隔多个编号，只能包含数字、字母、下划线和连字符" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input
                    v-model="strainForm.basic.sample_id"
                    placeholder="请输入样本编号，多个编号用逗号分隔"
                    :disabled="!isEditMode"
                    prefix-icon="Files"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="样本" prop="sample_source">
                  <DropdownInput
                    v-model="strainForm.basic.sample_source"
                    :options="sourceOptions"
                    placeholder="请选择或输入样本"
                    :disabled="!isEditMode"
                    @change="handleSourceChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="region">
                  <template #label>
                    <span>
                      <el-icon><Location /></el-icon>
                      地区
                      <el-tooltip content="样本采集的地理位置" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <DropdownInput
                    v-model="strainForm.basic.region"
                    :options="regionOptions"
                    placeholder="请选择或输入地区"
                    :disabled="!isEditMode"
                    @change="handleRegionChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="来源" prop="project_source">
                  <DropdownInput
                    v-model="strainForm.basic.project_source"
                    :options="projectOptions"
                    placeholder="请选择或输入来源"
                    :disabled="!isEditMode"
                    @change="handleProjectSourceChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="实验类型" prop="experiment_type">
                  <DropdownInput
                    v-model="strainForm.basic.experiment_type"
                    :options="experimentTypeOptions"
                    placeholder="请选择或输入实验类型"
                    :disabled="!isEditMode"
                    @change="handleExperimentTypeChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="发病日期" prop="onset_date">
                  <el-date-picker
                    v-model="strainForm.basic.onset_date"
                    type="date"
                    placeholder="选择发病日期"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="patient_name">
                  <template #label>
                    <span>
                      <el-icon><User /></el-icon>
                      名称
                      <el-tooltip content="如果是临床来源，填写病人姓名；如果是其他来源，填写样本名称" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input
                    v-model="strainForm.basic.patient_name"
                    placeholder="请输入病人姓名或样本名称"
                    :disabled="!isEditMode"
                    prefix-icon="User"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="patient_gender">
                  <template #label>
                    <span>
                      <el-icon><User /></el-icon>
                      性别
                      <el-tooltip content="患者性别信息" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-select
                    v-model="strainForm.basic.patient_gender"
                    placeholder="请选择性别"
                    :disabled="!isEditMode"
                  >
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                    <el-option label="未知" value="未知" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="patient_age">
                  <template #label>
                    <span>
                      <el-icon><Calendar /></el-icon>
                      年龄
                      <el-tooltip content="患者年龄信息" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input-number
                    v-model="strainForm.basic.patient_age"
                    placeholder="请输入年龄"
                    :disabled="!isEditMode"
                    :min="0"
                    :max="150"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="patient_id_number">
                  <template #label>
                    <span>
                      <el-icon><Document /></el-icon>
                      身份证号
                      <el-tooltip content="患者身份证号码" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input
                    v-model="strainForm.basic.patient_id_number"
                    placeholder="请输入身份证号"
                    :disabled="!isEditMode"
                    prefix-icon="Document"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="采样日期" prop="sampling_date">
                  <el-date-picker
                    v-model="strainForm.basic.sampling_date"
                    type="date"
                    placeholder="选择采样日期"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="isolation_date">
                  <template #label>
                    <span>
                      <el-icon><Calendar /></el-icon>
                      分离日期
                      <el-tooltip content="从样本中分离出菌株的日期" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-date-picker
                    v-model="strainForm.basic.isolation_date"
                    type="date"
                    placeholder="选择分离日期"
                    :disabled="!isEditMode"
                    prefix-icon="Calendar"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="submission_date">
                  <template #label>
                    <span>
                      <el-icon><Calendar /></el-icon>
                      上送日期
                      <el-tooltip content="将菌株上送到实验室的日期" placement="top">
                        <el-icon style="margin-left: 4px; color: #909399;"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-date-picker
                    v-model="strainForm.basic.submission_date"
                    type="date"
                    placeholder="选择上送日期"
                    :disabled="!isEditMode"
                    prefix-icon="Calendar"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="上传用户" prop="uploaded_by">
                  <el-input
                    v-model="strainForm.basic.uploaded_by"
                    placeholder="上传用户"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- 新增字段 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分离单位" prop="isolation_unit">
                  <el-input
                    v-model="strainForm.basic.isolation_unit"
                    placeholder="请输入分离单位"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="鉴定结果" prop="identification_result">
                  <el-input
                    v-model="strainForm.basic.identification_result"
                    placeholder="请输入鉴定结果"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="监测来源" prop="monitoring_source">
                  <el-input
                    v-model="strainForm.basic.monitoring_source"
                    placeholder="请输入监测来源"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="姓名" prop="patient_name">
                  <el-input
                    v-model="strainForm.basic.patient_name"
                    placeholder="请输入患者姓名"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="型别" prop="serotype">
                  <el-input
                    v-model="strainForm.basic.serotype"
                    placeholder="请输入型别"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年龄" prop="patient_age">
                  <el-input
                    v-model="strainForm.basic.patient_age"
                    placeholder="请输入年龄"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 特征信息 -->
        <el-tab-pane label="特征信息" name="characteristics">
          <el-form
            ref="characteristicsFormRef"
            :model="strainForm.characteristics"
            :rules="characteristicsFormRules"
            label-width="120px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="毒力基因" prop="virulence_genes">
                  <el-input
                    v-model="strainForm.characteristics.virulence_genes"
                    placeholder="请输入毒力基因"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="耐药谱" prop="antibiotic_resistance">
                  <el-input
                    v-model="strainForm.characteristics.antibiotic_resistance"
                    placeholder="请输入耐药谱"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="ST型别" prop="st_type">
                  <el-input
                    v-model="strainForm.characteristics.st_type"
                    placeholder="请输入ST型别"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="血清型别" prop="serotype">
                  <el-input
                    v-model="strainForm.characteristics.serotype"
                    placeholder="请输入血清型别"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分子血清型别" prop="molecular_serotype">
                  <el-input
                    v-model="strainForm.characteristics.molecular_serotype"
                    placeholder="请输入分子血清型别"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="strainDialogVisible = false">
            {{ isEditMode ? '取消' : '关闭' }}
          </el-button>
          <el-button
            type="primary"
            @click="saveStrain"
            v-if="isEditMode"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Close, CircleCheck, QuestionFilled, User, Location, Calendar, Files, Edit, Delete, InfoFilled, Clock, Timer, Finished, Top, Male, Female, Avatar, Loading } from '@element-plus/icons-vue'
// 引入IconPark图标
import {
  AddOne,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  People,
  Male as MaleIcon,
  Woman,
  Avatar as AvatarIcon,
  IdCard,
  Baby,
  Search,
  Microscope,
  TestTube,
  MedicineBottle,
  Hospital
} from '@icon-park/vue-next'
import DropdownInput from '@/components/DropdownInput.vue'

export default {
  name: 'Strains',
  components: {
    Document,
    Close,
    CircleCheck,
    Edit,
    Delete,
    User,
    Clock,
    Timer,
    DropdownInput
  },
  setup () {
    const store = useStore()
    const loading = ref(false)
    const strains = ref([])
    const selectedStrains = ref([])
    const quickSearchText = ref('')

    // 导入相关数据
    const importDialogVisible = ref(false)
    const importStep = ref(0)
    const selectedFile = ref(null)
    const fileFields = ref([])
    const importData = ref([])
    const validRecords = ref([])
    const errorRecords = ref([])
    const importedCount = ref(0)
    const importProgress = ref(0)
    const isImporting = ref(false)

    // 导出相关数据
    const exportDialogVisible = ref(false)
    const exportFormat = ref('xlsx')
    const exportLoading = ref(false)
    const uploadRef = ref(null)

    // 字段映射配置
    const fieldMappingData = ref([
      { systemField: 'strain_id', systemFieldLabel: '菌株编号', fileField: '', required: true, description: '唯一标识菌株的编号' },
      { systemField: 'species', systemFieldLabel: '菌种(属)', fileField: '', required: true, description: '菌种类型' },
      { systemField: 'sample_id', systemFieldLabel: '样本编号', fileField: '', required: false, description: '样本的唯一编号' },
      { systemField: 'sample_source', systemFieldLabel: '样本', fileField: '', required: false, description: '样本的来源类型' },
      { systemField: 'region', systemFieldLabel: '地区', fileField: '', required: true, description: '地理位置' },
      { systemField: 'project_source', systemFieldLabel: '来源', fileField: '', required: false, description: '项目来源' },
      { systemField: 'onset_date', systemFieldLabel: '发病日期', fileField: '', required: false, description: '发病的时间' },
      { systemField: 'sampling_date', systemFieldLabel: '采样日期', fileField: '', required: false, description: '采样的时间' },
      { systemField: 'isolation_date', systemFieldLabel: '分离日期', fileField: '', required: true, description: '分离的时间' },
      { systemField: 'submission_date', systemFieldLabel: '上送日期', fileField: '', required: true, description: '上送的时间' },
      { systemField: 'patient_name', systemFieldLabel: '名称', fileField: '', required: false, description: '病人姓名或样本名称' },
      { systemField: 'st_type', systemFieldLabel: 'ST型', fileField: '', required: false, description: '序列分型' },
      { systemField: 'serotype', systemFieldLabel: '血清型', fileField: '', required: false, description: '血清分型' },
      { systemField: 'virulence_genes', systemFieldLabel: '毒力基因', fileField: '', required: false, description: '毒力基因信息' },
      { systemField: 'antibiotic_resistance', systemFieldLabel: '耐药谱', fileField: '', required: false, description: '抗生素耐药性' },
      { systemField: 'molecular_serotype', systemFieldLabel: '分子血清型', fileField: '', required: false, description: '分子血清分型' }
    ])

    const filterForm = reactive({
      strain_id: '',
      species: '',
      region: '',
      sample_source: '',
      project_source: '',
      experiment_type: ''
    })

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    // 排序相关数据
    const sortConfig = reactive({
      prop: 'id',
      order: 'ascending'
    })

    // 对话框相关
    const strainDialogVisible = ref(false)
    const isEditMode = ref(false)
    const activeTab = ref('basic')
    const basicFormRef = ref(null)
    const characteristicsFormRef = ref(null)

    const strainForm = reactive({
      basic: {
        id: null,
        sequence_number: null, // 序号（自动生成）
        strain_id: '',
        species: '',
        sample_id: '',
        sample_source: '',
        region: '',
        project_source: '', // 来源
        experiment_type: '',
        onset_date: '',
        sampling_date: '',
        isolation_date: '',
        submission_date: '', // 上送日期
        patient_name: '', // 名称
        patient_gender: '', // 性别
        patient_age: null, // 年龄
        patient_id_number: '', // 身份证号
        uploaded_by: '',
        created_at: ''
      },
      characteristics: {
        virulence_genes: '',
        antibiotic_resistance: '',
        st_type: '',
        serotype: '',
        molecular_serotype: ''
      }
    })

    // 自定义验证函数
    const validateStrainIdUnique = async (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }

      try {
        // 检查菌株编号是否已存在
        const existingStrains = strains.value.filter(strain =>
          strain.strain_id === value && strain.id !== strainForm.basic.id
        )

        if (existingStrains.length > 0) {
          callback(new Error('菌株编号已存在'))
        } else {
          callback()
        }
      } catch (error) {
        console.error('验证菌株编号唯一性失败:', error)
        callback()
      }
    }

    const validateSampleId = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }

      try {
        // 验证多个样本编号（逗号分隔）
        const sampleIds = value.split(',')
        const sampleIdPattern = /^[a-zA-Z0-9_-]+$/

        for (const sampleId of sampleIds) {
          const cleanSampleId = sampleId.trim()
          if (cleanSampleId.length === 0) {
            callback(new Error('样本编号不能为空'))
            return
          }
          if (!sampleIdPattern.test(cleanSampleId)) {
            callback(new Error('样本编号只能包含数字、大小写英文字母、下划线和连字符'))
            return
          }
        }

        callback()
      } catch (error) {
        console.error('验证样本编号失败:', error)
        callback(new Error('样本编号格式错误'))
      }
    }

    const basicFormRules = {
      strain_id: [
        { required: true, message: '请输入菌株编号', trigger: 'blur' },
        { min: 3, max: 50, message: '菌株编号长度必须在3-50个字符之间', trigger: 'blur' },
        {
          pattern: /^[a-zA-Z0-9_-]+$/,
          message: '菌株编号只能包含数字、大小写英文字母、下划线和连字符',
          trigger: 'blur'
        },
        { validator: validateStrainIdUnique, trigger: 'blur' }
      ],
      species: [
        { required: true, message: '请选择菌种', trigger: 'change' }
      ],
      sample_id: [
        { required: false, message: '请输入样本编号', trigger: 'blur' },
        { max: 255, message: '样本编号长度不能超过255个字符', trigger: 'blur' },
        { validator: validateSampleId, trigger: 'blur' }
      ],
      sample_source: [
        { required: false, message: '请选择样本', trigger: 'change' }
      ],
      region: [
        { required: true, message: '请选择地区', trigger: 'change' }
      ],
      isolation_date: [
        { required: true, message: '请选择分离日期', trigger: 'change' }
      ],
      submission_date: [
        { required: true, message: '请选择上送日期', trigger: 'change' }
      ],
      patient_name: [
        { max: 255, message: '名称长度不能超过255个字符', trigger: 'blur' }
      ],
      patient_gender: [
        { max: 10, message: '性别长度不能超过10个字符', trigger: 'blur' }
      ],
      patient_age: [
        { type: 'number', min: 0, max: 150, message: '年龄必须在0-150之间', trigger: 'blur' }
      ],
      patient_id_number: [
        { max: 18, message: '身份证号长度不能超过18个字符', trigger: 'blur' },
        {
          pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
          message: '请输入正确的身份证号格式',
          trigger: 'blur'
        }
      ],
      project_source: [
        { max: 50, message: '来源长度不能超过50个字符', trigger: 'blur' }
      ]
    }

    const characteristicsFormRules = {
      // 特征信息的验证规则可以根据需要添加
    }

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑菌株' : '菌株详情'
    })

    // 修复现有数据的序号
    const fixSequenceNumbers = (strainsList) => {
      let hasChanges = false
      strainsList.forEach((strain, index) => {
        if (typeof strain.sequence_number === 'undefined' || strain.sequence_number === null) {
          strain.sequence_number = index + 1
          hasChanges = true
        }
      })
      return hasChanges
    }

    const loadStrains = async () => {
      loading.value = true
      try {
        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API加载菌株数据
          const allStrains = await window.electronAPI.strains.getAll()
          strains.value = allStrains || []
          pagination.total = strains.value.length
        } else {
          // 开发环境或Web环境：从localStorage获取数据，如果没有则使用模拟数据
          const savedStrains = localStorage.getItem('pams_strains')
          if (savedStrains) {
            try {
              strains.value = JSON.parse(savedStrains)

              // 修复序号问题
              const needsUpdate = fixSequenceNumbers(strains.value)
              if (needsUpdate) {
                localStorage.setItem('pams_strains', JSON.stringify(strains.value))
              }

              pagination.total = strains.value.length
            } catch (e) {
              console.error('解析保存的菌株数据失败:', e)
              // 如果解析失败，使用默认数据
              initializeDefaultStrains()
            }
          } else {
            // 初始化默认数据
            initializeDefaultStrains()
          }
        }
      } catch (error) {
        console.error('加载菌株数据失败:', error)
        ElMessage.error('加载菌株数据失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    // 初始化默认菌株数据
    const initializeDefaultStrains = () => {
      strains.value = []
      pagination.total = 0
      // 保存到localStorage
      localStorage.setItem('pams_strains', JSON.stringify(strains.value))
    }

    // 过滤菌株数据
    const filteredStrains = computed(() => {
      let filtered = strains.value

      // 快速搜索过滤
      if (quickSearchText.value) {
        const searchText = quickSearchText.value.toLowerCase()
        filtered = filtered.filter(strain => {
          return (strain.strain_id && strain.strain_id.toLowerCase().includes(searchText)) ||
                 (strain.sample_id && strain.sample_id.toLowerCase().includes(searchText)) ||
                 (strain.species && strain.species.toLowerCase().includes(searchText)) ||
                 (strain.patient_name && strain.patient_name.toLowerCase().includes(searchText))
        })
      }

      // 菌株编号过滤
      if (filterForm.strain_id) {
        filtered = filtered.filter(strain =>
          strain.strain_id && strain.strain_id.toLowerCase().includes(filterForm.strain_id.toLowerCase())
        )
      }

      // 菌种过滤
      if (filterForm.species) {
        filtered = filtered.filter(strain =>
          strain.species && strain.species.includes(filterForm.species)
        )
      }

      // 地区过滤
      if (filterForm.region) {
        filtered = filtered.filter(strain =>
          strain.region && strain.region.includes(filterForm.region)
        )
      }

      // 样本来源过滤
      if (filterForm.sample_source) {
        filtered = filtered.filter(strain =>
          strain.sample_source && strain.sample_source.includes(filterForm.sample_source)
        )
      }

      // 实验类型过滤
      if (filterForm.experiment_type) {
        filtered = filtered.filter(strain =>
          strain.experiment_type && strain.experiment_type.includes(filterForm.experiment_type)
        )
      }

      // 分离单位过滤
      if (filterForm.isolation_unit) {
        filtered = filtered.filter(strain =>
          strain.isolation_unit && strain.isolation_unit.toLowerCase().includes(filterForm.isolation_unit.toLowerCase())
        )
      }

      // 监测来源过滤
      if (filterForm.monitoring_source) {
        filtered = filtered.filter(strain =>
          strain.monitoring_source && strain.monitoring_source.toLowerCase().includes(filterForm.monitoring_source.toLowerCase())
        )
      }

      // 型别过滤
      if (filterForm.serotype) {
        filtered = filtered.filter(strain =>
          strain.serotype && strain.serotype.toLowerCase().includes(filterForm.serotype.toLowerCase())
        )
      }

      return filtered
    })

    // 排序后的菌株数据
    const sortedStrains = computed(() => {
      const data = [...filteredStrains.value]

      if (!sortConfig.prop) {
        return data
      }

      return data.sort((a, b) => {
        let aVal = a[sortConfig.prop]
        let bVal = b[sortConfig.prop]

        // 处理空值
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return sortConfig.order === 'ascending' ? 1 : -1
        if (bVal == null) return sortConfig.order === 'ascending' ? -1 : 1

        // 数字类型排序
        if (sortConfig.prop === 'id' || sortConfig.prop === 'sequence_number' || sortConfig.prop === 'patient_age') {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
          return sortConfig.order === 'ascending' ? aVal - bVal : bVal - aVal
        }

        // 日期类型排序
        if (sortConfig.prop.includes('_date') || sortConfig.prop.includes('_at')) {
          aVal = new Date(aVal).getTime() || 0
          bVal = new Date(bVal).getTime() || 0
          return sortConfig.order === 'ascending' ? aVal - bVal : bVal - aVal
        }

        // 字符串类型排序
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()

        if (aVal < bVal) return sortConfig.order === 'ascending' ? -1 : 1
        if (aVal > bVal) return sortConfig.order === 'ascending' ? 1 : -1
        return 0
      })
    })

    // 分页后的菌株数据
    const paginatedStrains = computed(() => {
      const sorted = sortedStrains.value
      const start = (pagination.current - 1) * pagination.size
      const end = start + pagination.size

      return sorted.slice(start, end)
    })

    // 监听排序数据变化，更新分页总数
    watch(sortedStrains, (newSorted) => {
      pagination.total = newSorted.length
    }, { immediate: true })

    // 处理排序变化
    const handleSortChange = ({ prop, order }) => {
      sortConfig.prop = prop
      sortConfig.order = order
    }

    const searchStrains = () => {
      pagination.current = 1
      // 不需要重新加载数据，过滤逻辑在计算属性中处理
    }

    const resetFilter = () => {
      filterForm.strain_id = ''
      filterForm.species = ''
      filterForm.region = ''
      filterForm.sample_source = ''
      filterForm.experiment_type = ''
      filterForm.isolation_unit = ''
      filterForm.monitoring_source = ''
      filterForm.serotype = ''
      searchStrains()
    }

    const addStrain = () => {
      isEditMode.value = true
      activeTab.value = 'basic'
      resetStrainForm()

      // 自动生成菌株编号（按流水号排序）
      const maxStrainId = strains.value.reduce((max, strain) => {
        const strainIdNum = parseInt(strain.strain_id)
        return isNaN(strainIdNum) ? max : Math.max(max, strainIdNum)
      }, 0)
      strainForm.basic.strain_id = String(maxStrainId + 1).padStart(6, '0') // 生成6位数字，前面补0

      strainForm.basic.uploaded_by = store.getters['auth/user'].username
      strainDialogVisible.value = true
    }

    const importStrains = () => {
      // 重置导入状态
      importStep.value = 0
      selectedFile.value = null
      fileFields.value = []
      importData.value = []
      validRecords.value = []
      errorRecords.value = []
      importedCount.value = 0

      // 重置字段映射
      fieldMappingData.value.forEach(field => {
        field.fileField = ''
      })

      importDialogVisible.value = true
    }

    const exportStrains = () => {
      // 检查是否有选中的菌株
      if (selectedStrains.value.length === 0) {
        ElMessage.warning('请先选择要导出的菌株')
        return
      }

      // 显示导出格式选择对话框
      exportDialogVisible.value = true
    }

    const viewStrain = (strain) => {
      isEditMode.value = false
      activeTab.value = 'basic'
      loadStrainToForm(strain)
      strainDialogVisible.value = true
    }

    const editStrain = (strain) => {
      isEditMode.value = true
      activeTab.value = 'basic'
      loadStrainToForm(strain)
      strainDialogVisible.value = true
    }

    const deleteStrain = async (strain) => {
      try {
        await ElMessageBox.confirm('确定要删除该菌株吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API删除
          await window.electronAPI.strains.delete(strain.id)
          ElMessage.success('删除成功')
          await loadStrains()
        } else {
          // 开发环境的localStorage删除
          const index = strains.value.findIndex(s => s.id === strain.id)
          if (index !== -1) {
            strains.value.splice(index, 1)
            pagination.total = strains.value.length
            // 保存到localStorage
            localStorage.setItem('pams_strains', JSON.stringify(strains.value))
            ElMessage.success('删除成功')
          } else {
            ElMessage.error('菌株不存在')
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除菌株失败:', error)
          ElMessage.error('删除失败：' + error.message)
        }
      }
    }

    // 选择相关方法
    const handleSelectionChange = (selection) => {
      selectedStrains.value = selection
    }

    const batchDelete = async () => {
      if (selectedStrains.value.length === 0) {
        ElMessage.warning('请先选择要删除的菌株')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedStrains.value.length} 个菌株吗？`,
          '批量删除提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API批量删除
          const deletePromises = selectedStrains.value.map(strain =>
            window.electronAPI.strains.delete(strain.id)
          )
          await Promise.all(deletePromises)
          ElMessage.success(`成功删除 ${selectedStrains.value.length} 个菌株`)
          selectedStrains.value = []
          await loadStrains()
        } else {
          // 开发环境的localStorage批量删除
          const deleteCount = selectedStrains.value.length
          const idsToDelete = selectedStrains.value.map(strain => strain.id)
          strains.value = strains.value.filter(strain => !idsToDelete.includes(strain.id))
          pagination.total = strains.value.length
          // 保存到localStorage
          localStorage.setItem('pams_strains', JSON.stringify(strains.value))
          ElMessage.success(`成功删除 ${deleteCount} 个菌株`)
          selectedStrains.value = []
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败')
        }
      }
    }

    // 导入相关方法
    const handleFileChange = (file) => {
      selectedFile.value = file
      parseFile(file)
    }

    const clearFile = () => {
      selectedFile.value = null
      fileFields.value = []
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    }

    // 自动映射字段函数
    const autoMapFields = (headers) => {
      // 定义字段映射规则
      const fieldMappingRules = {
        strain_id: ['菌株编号', 'strain_id', 'strainid', '编号'],
        species: ['菌种(属)', '菌种类型', '菌种', 'species', '种类'],
        sample_id: ['样本编号', 'sample_id', 'sampleid', '样本号'],
        sample_source: ['样本', '样本来源', 'sample_source', '来源', '源'],
        region: ['地区', '采集地区', 'region', '地点', '位置'],
        project_source: ['来源', '项目来源', 'project_source', '项目'],
        onset_date: ['发病日期', '发病时间', 'onset_date', '发病'],
        sampling_date: ['采样日期', '采样时间', 'sampling_date', '采样'],
        isolation_date: ['分离日期', '分离时间', 'isolation_date', '分离'],
        submission_date: ['上送日期', '上送时间', 'submission_date', '上送'],
        patient_name: ['名称', '病人姓名', '样本名称', 'patient_name', '姓名'],
        st_type: ['ST型', 'st_type', 'st', 'ST'],
        serotype: ['血清型', 'serotype', '血清'],
        virulence_genes: ['毒力基因', 'virulence_genes', '毒力'],
        antibiotic_resistance: ['耐药谱', 'antibiotic_resistance', '耐药', '抗药性'],
        molecular_serotype: ['分子血清型', 'molecular_serotype', '分子血清']
      }

      fieldMappingData.value.forEach(field => {
        // 重置字段映射
        field.fileField = ''

        // 获取该字段的映射规则
        const rules = fieldMappingRules[field.systemField] || []

        // 尝试找到完全匹配的表头
        for (const rule of rules) {
          const exactMatch = headers.find(header => header === rule)
          if (exactMatch) {
            field.fileField = exactMatch
            return
          }
        }

        // 如果没有完全匹配，尝试模糊匹配
        const normalizeString = (str) => str.replace(/[\s()（）]/g, '').toLowerCase()

        for (const rule of rules) {
          const normalizedRule = normalizeString(rule)
          const fuzzyMatch = headers.find(header => {
            const normalizedHeader = normalizeString(header)
            return normalizedHeader === normalizedRule ||
                   normalizedHeader.includes(normalizedRule) ||
                   normalizedRule.includes(normalizedHeader)
          })

          if (fuzzyMatch) {
            field.fileField = fuzzyMatch
            return
          }
        }
      })
    }

    const parseFile = (file) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = e.target.result
        const extension = file.name.split('.').pop().toLowerCase()

        try {
          if (extension === 'csv') {
            parseCSV(data)
          } else if (extension === 'tsv') {
            parseTSV(data)
          } else if (extension === 'xlsx') {
            await parseExcel(data)
          }
        } catch (error) {
          ElMessage.error('文件解析失败：' + error.message)
        }
      }

      if (file.name.endsWith('.xlsx')) {
        reader.readAsArrayBuffer(file.raw)
      } else {
        reader.readAsText(file.raw)
      }
    }

    const parseCSV = (data) => {
      try {
        const lines = data.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          ElMessage.error('文件内容不足，至少需要标题行和数据行')
          return
        }

        // 改进的CSV解析，支持引号包围的字段
        const parseCSVLine = (line) => {
          const result = []
          let current = ''
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }

          result.push(current.trim())
          return result
        }

        // 解析表头
        const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''))
        fileFields.value = headers

        // 自动映射字段
        autoMapFields(headers)

        // 解析数据行
        const rows = lines.slice(1).map(line => {
          const values = parseCSVLine(line).map(v => v.replace(/"/g, ''))
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          return row
        })

        importData.value = rows
        ElMessage.success(`解析成功，共 ${rows.length} 条记录`)
      } catch (error) {
        console.error('CSV解析失败:', error)
        ElMessage.error('CSV解析失败：' + error.message)
      }
    }

    const parseTSV = (data) => {
      const lines = data.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        ElMessage.error('文件内容不足，至少需要标题行和数据行')
        return
      }

      const headers = lines[0].split('\t').map(h => h.trim())
      fileFields.value = headers

      // 自动映射字段
      autoMapFields(headers)

      const rows = lines.slice(1).map(line => {
        const values = line.split('\t').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      importData.value = rows
      ElMessage.success(`解析成功，共 ${rows.length} 条记录`)
    }

    const parseExcel = async (data) => {
      try {
        let XLSX

        // 尝试不同的方式导入xlsx库
        try {
          // 方法1: 动态导入
          XLSX = await import('xlsx')
        } catch (dynamicImportError) {
          console.warn('动态导入失败，尝试使用require:', dynamicImportError)
          try {
            // 方法2: 如果是Electron环境，尝试使用require
            if (window.require && typeof window.require === 'function') {
              XLSX = window.require('xlsx')
            } else {
              throw new Error('无法加载XLSX库')
            }
          } catch (requireError) {
            console.warn('require方式也失败:', requireError)
            throw new Error('XLSX库加载失败，请检查依赖安装')
          }
        }

        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        // 转换为JSON格式
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        if (jsonData.length < 2) {
          ElMessage.error('文件内容不足，至少需要标题行和数据行')
          return
        }

        // 获取表头（第一行）
        const headers = jsonData[0].filter(header => header && header.toString().trim())
        if (headers.length === 0) {
          ElMessage.error('未找到有效的表头信息')
          return
        }

        fileFields.value = headers

        // 自动映射字段
        autoMapFields(headers)

        // 处理数据行
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell && cell.toString().trim())).map(row => {
          const rowData = {}
          headers.forEach((header, index) => {
            rowData[header] = row[index] ? row[index].toString().trim() : ''
          })
          return rowData
        })

        importData.value = rows
        ElMessage.success(`解析成功，共 ${rows.length} 条记录`)
      } catch (error) {
        console.error('Excel解析失败:', error)

        // 提供更详细的错误信息
        if (error.message.includes('Cannot resolve module') || error.message.includes('XLSX库加载失败')) {
          ElMessage.error('Excel解析库未能正确加载，请尝试使用CSV格式文件')
        } else if (error.message.includes('not defined') || error.message.includes('could not be created')) {
          ElMessage.error('文件解析失败，建议将Excel文件转换为CSV格式后导入')
        } else {
          ElMessage.error('Excel解析失败：' + error.message)
        }
      }
    }

    const canNextStep = computed(() => {
      switch (importStep.value) {
      case 0:
        return selectedFile.value && fileFields.value.length > 0
      case 1: {
        // 检查必填字段是否已映射
        const requiredFields = fieldMappingData.value.filter(field => field.required)
        return requiredFields.every(field => field.fileField)
      }
      case 2:
        return validRecords.value.length > 0
      default:
        return false
      }
    })

    const nextStep = async () => {
      try {
        if (importStep.value === 0) {
          // 进入字段映射步骤
          importStep.value = 1
        } else if (importStep.value === 1) {
          // 进入数据验证步骤
          validateData()
          importStep.value = 2
        } else if (importStep.value === 2) {
          // 开始导入
          await performImport()
          importStep.value = 3
        }
      } catch (error) {
        console.error('导入步骤失败:', error)
        // 保持在当前步骤，不前进
      }
    }

    const prevStep = () => {
      if (importStep.value > 0) {
        importStep.value--
      }
    }

    const validateData = () => {
      validRecords.value = []
      errorRecords.value = []

      importData.value.forEach((row, index) => {
        const errors = []
        const mappedData = {}

        // 检查必填字段
        const requiredFields = fieldMappingData.value.filter(field => field.required)
        requiredFields.forEach(field => {
          const fileField = field.fileField
          const value = row[fileField]

          if (!value || value.trim() === '') {
            errors.push({
              rowIndex: index + 2, // +2 因为有标题行，且从1开始计数
              field: field.systemFieldLabel,
              value: value || '',
              error: '必填字段不能为空'
            })
          } else {
            let processedValue = value

            // 特殊处理日期字段
            if (field.systemField.includes('date') || field.systemField.includes('time')) {
              // 尝试解析和标准化日期格式
              const dateValue = new Date(processedValue)
              if (!isNaN(dateValue.getTime())) {
                processedValue = dateValue.toISOString().split('T')[0] // YYYY-MM-DD格式
              }
            }

            mappedData[field.systemField] = processedValue
          }
        })

        // 检查可选字段
        const optionalFields = fieldMappingData.value.filter(field => !field.required)
        optionalFields.forEach(field => {
          const fileField = field.fileField
          if (fileField && row[fileField]) {
            let value = row[fileField]

            // 特殊处理日期字段
            if (field.systemField.includes('date') || field.systemField.includes('time')) {
              // 尝试解析和标准化日期格式
              const dateValue = new Date(value)
              if (!isNaN(dateValue.getTime())) {
                value = dateValue.toISOString().split('T')[0] // YYYY-MM-DD格式
              }
            }

            mappedData[field.systemField] = value
          }
        })

        // 检查菌株编号是否重复
        if (mappedData.strain_id) {
          const existingStrain = strains.value.find(strain => strain.strain_id === mappedData.strain_id)
          if (existingStrain) {
            errors.push({
              rowIndex: index + 2,
              field: '菌株编号',
              value: mappedData.strain_id,
              error: '菌株编号已存在'
            })
          }
        }

        if (errors.length > 0) {
          errorRecords.value.push(...errors)
        } else {
          // 处理日期格式转换，确保所有数据都是简单的字符串类型
          const processedData = {}

          // 1. 数据清理 - 确保所有值都是字符串
          Object.keys(mappedData).forEach(key => {
            const value = mappedData[key]
            if (value !== null && value !== undefined) {
              processedData[key] = String(value).trim()
            }
          })

          // 2. 安全的用户信息处理
          const user = store.getters['auth/user']
          processedData.uploaded_by = user && user.username ? String(user.username) : 'unknown'

          // 3. 数据处理完成，准备添加到记录中

          validRecords.value.push(processedData)
        }
      })
    }

    // 优化的批量导入函数
    const performImport = async () => {
      const BATCH_SIZE = 100 // 每批处理100条记录
      const totalRecords = validRecords.value.length
      let processedCount = 0
      let successCount = 0
      const errors = []

      // 初始化进度
      isImporting.value = true
      importProgress.value = 0

      try {
        if (window.electronAPI && window.electronAPI.strains) {
          // 分批处理数据
          for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
            const batch = validRecords.value.slice(i, i + BATCH_SIZE)

            // 创建完全可序列化的数据副本
            const serializableRecords = batch.map(record => {
              const cleanRecord = {}

              // 确保所有字段都是简单类型
              Object.keys(record).forEach(key => {
                // 跳过id字段，让数据库自动分配
                if (key === 'id') {
                  return
                }

                const value = record[key]
                if (value !== null && value !== undefined) {
                  let cleanValue = value

                  // 转换为基本类型
                  if (typeof value === 'string') {
                    // 清理字符串值，移除可能导致问题的字符
                    cleanValue = value.trim()
                  } else if (typeof value === 'number' || typeof value === 'boolean') {
                    cleanValue = value
                  } else {
                    // 对象或其他类型转换为字符串
                    cleanValue = String(value).trim()
                  }

                  // 只有非空值才添加
                  if (cleanValue !== '') {
                    cleanRecord[key] = cleanValue
                  }
                }
              })

              return cleanRecord
            })

            try {
              // 使用批量创建API
              const result = await window.electronAPI.strains.batchCreate(serializableRecords)

              if (result.success) {
                successCount += result.created
                if (result.errors && result.errors.length > 0) {
                  errors.push(...result.errors)
                }
              } else {
                errors.push(`批次 ${Math.floor(i / BATCH_SIZE) + 1} 导入失败`)
              }
            } catch (batchError) {
              console.warn(`批次 ${Math.floor(i / BATCH_SIZE) + 1} 批量导入失败，尝试逐条导入:`, batchError)

              // 如果批量导入失败，回退到逐条导入
              for (let j = 0; j < serializableRecords.length; j++) {
                try {
                  await window.electronAPI.strains.create(serializableRecords[j])
                  successCount++
                } catch (error) {
                  errors.push(`第${i + j + 1}条记录导入失败: ${error.message}`)
                }
              }
            }

            processedCount += batch.length

            // 更新进度
            importProgress.value = Math.round((processedCount / totalRecords) * 100)
            console.log(`导入进度: ${importProgress.value}% (${processedCount}/${totalRecords})`)

            // 让出控制权，避免阻塞UI
            await new Promise(resolve => setTimeout(resolve, 10))
          }

          importedCount.value = successCount

          if (errors.length > 0) {
            console.warn('部分记录导入失败:', errors)
            ElMessage.warning(`成功导入 ${successCount} 条记录，${errors.length} 条记录失败`)
          } else {
            ElMessage.success(`成功导入 ${successCount} 条记录`)
          }

          // 重新加载数据
          await loadStrains()
        } else {
          // 开发环境的localStorage导入 - 优化版本
          // 获取当前最大ID和序号，确保新ID和序号不重复
          let nextId = strains.value.length > 0
            ? Math.max(...strains.value.map(s => s.id || 0)) + 1
            : 1

          let nextSequenceNumber = strains.value.length > 0
            ? Math.max(...strains.value.map(s => s.sequence_number || 0)) + 1
            : 1

          // 分批处理避免阻塞UI
          for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
            const batch = validRecords.value.slice(i, i + BATCH_SIZE)

            batch.forEach((record, batchIndex) => {
              const globalIndex = i + batchIndex
              try {
                // 检查菌株编号是否重复
                const existingStrain = strains.value.find(strain =>
                  strain.strain_id === record.strain_id
                )

                if (existingStrain) {
                  errors.push(`第${globalIndex + 1}条记录：菌株编号 ${record.strain_id} 已存在`)
                  return
                }

                // 移除原有的id字段，生成新的唯一ID
                const cleanRecord = { ...record }
                delete cleanRecord.id

                const strainData = {
                  ...cleanRecord,
                  id: nextId++, // 使用递增的ID确保唯一性
                  sequence_number: nextSequenceNumber++, // 使用递增的序号
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
                strains.value.push(strainData)
                successCount++
              } catch (error) {
                errors.push(`第${globalIndex + 1}条记录导入失败: ${error.message}`)
              }
            })

            processedCount += batch.length

            // 更新进度
            importProgress.value = Math.round((processedCount / totalRecords) * 100)
            console.log(`导入进度: ${importProgress.value}% (${processedCount}/${totalRecords})`)

            // 让出控制权，避免阻塞UI
            await new Promise(resolve => setTimeout(resolve, 10))
          }

          // 保存到localStorage
          localStorage.setItem('pams_strains', JSON.stringify(strains.value))
          importedCount.value = successCount

          if (errors.length > 0) {
            console.warn('部分记录导入失败:', errors)
            ElMessage.warning(`成功导入 ${successCount} 条记录，${errors.length} 条记录失败`)
          } else {
            ElMessage.success(`成功导入 ${successCount} 条记录`)
          }
        }
      } catch (error) {
        console.error('导入菌株失败:', error)
        ElMessage.error('导入失败：' + error.message)
        throw error
      } finally {
        // 重置进度状态
        isImporting.value = false
        importProgress.value = 0
      }
    }

    const finishImport = () => {
      importDialogVisible.value = false
      loadStrains()
    }

    // 导出功能
    const performExport = async () => {
      if (selectedStrains.value.length === 0) {
        ElMessage.warning('请先选择要导出的菌株')
        return
      }

      exportLoading.value = true
      try {
        // 准备导出数据
        const exportData = selectedStrains.value.map(strain => ({
          菌株编号: strain.strain_id || '',
          菌种: strain.species || '',
          样本编号: strain.sample_id || '',
          样本来源: strain.sample_source || '',
          地区: strain.region || '',
          来源: strain.project_source || '',
          实验类型: strain.experiment_type || '',
          毒力基因: strain.virulence_genes || '',
          耐药谱: strain.antibiotic_resistance || '',
          ST型: strain.st_type || '',
          血清型: strain.serotype || '',
          分子血清型: strain.molecular_serotype || '',
          上传信息: `用户:${strain.uploaded_by || '未知'} | 创建:${strain.created_at ? new Date(strain.created_at).toLocaleString() : '未知'} | 更新:${strain.updated_at ? new Date(strain.updated_at).toLocaleString() : '未知'}`
        }))

        // 根据选择的格式导出
        if (exportFormat.value === 'xlsx') {
          await exportToExcel(exportData)
        } else if (exportFormat.value === 'csv') {
          await exportToCSV(exportData)
        } else if (exportFormat.value === 'tsv') {
          await exportToTSV(exportData)
        }

        ElMessage.success(`成功导出 ${selectedStrains.value.length} 条菌株数据`)
        exportDialogVisible.value = false
      } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error('导出失败：' + error.message)
      } finally {
        exportLoading.value = false
      }
    }

    // 导出为Excel格式
    const exportToExcel = async (data) => {
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '菌株数据')

      // 设置列宽
      const colWidths = [
        { wch: 15 }, // 菌株编号
        { wch: 12 }, // 菌种
        { wch: 15 }, // 样本编号
        { wch: 12 }, // 样本来源
        { wch: 10 }, // 地区
        { wch: 12 }, // 来源
        { wch: 12 }, // 实验类型
        { wch: 20 }, // 毒力基因
        { wch: 20 }, // 耐药谱
        { wch: 10 }, // ST型
        { wch: 12 }, // 血清型
        { wch: 15 }, // 分子血清型
        { wch: 50 } // 上传信息
      ]
      worksheet['!cols'] = colWidths

      const fileName = `菌株数据_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
    }

    // 导出为CSV格式
    const exportToCSV = async (data) => {
      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `菌株数据_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // 导出为TSV格式
    const exportToTSV = async (data) => {
      const headers = Object.keys(data[0])
      const tsvContent = [
        headers.join('\t'),
        ...data.map(row => headers.map(header => row[header] || '').join('\t'))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `菌株数据_${new Date().toISOString().split('T')[0]}.tsv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1 // 重置到第一页
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
    }

    // 对话框相关方法
    const resetStrainForm = () => {
      strainForm.basic.id = null
      strainForm.basic.sequence_number = null
      strainForm.basic.strain_id = ''
      strainForm.basic.species = ''
      strainForm.basic.sample_id = ''
      strainForm.basic.sample_source = ''
      strainForm.basic.region = ''
      strainForm.basic.project_source = ''
      strainForm.basic.experiment_type = ''
      strainForm.basic.onset_date = ''
      strainForm.basic.sampling_date = ''
      strainForm.basic.isolation_date = ''
      strainForm.basic.submission_date = ''
      strainForm.basic.patient_name = ''
      strainForm.basic.patient_gender = ''
      strainForm.basic.patient_age = null
      strainForm.basic.patient_id_number = ''
      strainForm.basic.uploaded_by = ''
      strainForm.basic.created_at = ''
      strainForm.characteristics.virulence_genes = ''
      strainForm.characteristics.antibiotic_resistance = ''
      strainForm.characteristics.st_type = ''
      strainForm.characteristics.serotype = ''
      strainForm.characteristics.molecular_serotype = ''
    }

    const loadStrainToForm = (strain) => {
      strainForm.basic.id = strain.id
      strainForm.basic.sequence_number = strain.sequence_number
      strainForm.basic.strain_id = strain.strain_id
      strainForm.basic.species = strain.species
      strainForm.basic.sample_id = strain.sample_id
      strainForm.basic.sample_source = strain.sample_source
      strainForm.basic.region = strain.region
      strainForm.basic.project_source = strain.project_source || ''
      strainForm.basic.experiment_type = strain.experiment_type || ''
      strainForm.basic.onset_date = strain.onset_date
      strainForm.basic.sampling_date = strain.sampling_date
      strainForm.basic.isolation_date = strain.isolation_date
      strainForm.basic.submission_date = strain.submission_date
      strainForm.basic.patient_name = strain.patient_name || ''
      strainForm.basic.patient_gender = strain.patient_gender || ''
      strainForm.basic.patient_age = strain.patient_age || null
      strainForm.basic.patient_id_number = strain.patient_id_number || ''
      strainForm.basic.uploaded_by = strain.uploaded_by
      strainForm.basic.created_at = strain.created_at

      // 加载特征信息
      strainForm.characteristics.virulence_genes = strain.virulence_genes || ''
      strainForm.characteristics.antibiotic_resistance = strain.antibiotic_resistance || ''
      strainForm.characteristics.st_type = strain.st_type || ''
      strainForm.characteristics.serotype = strain.serotype || ''
      strainForm.characteristics.molecular_serotype = strain.molecular_serotype || ''
    }

    const closeDialog = () => {
      resetStrainForm()
      activeTab.value = 'basic'
    }

    const saveStrain = async () => {
      try {
        // 验证基本信息
        if (basicFormRef.value) {
          await basicFormRef.value.validate()
        }

        // 验证特征信息（如果有需要）
        if (characteristicsFormRef.value) {
          await characteristicsFormRef.value.validate()
        }

        // 准备菌株数据
        const strainData = {
          ...strainForm.basic,
          ...strainForm.characteristics
        }

        // 移除id字段（后端会自动生成）
        delete strainData.id
        delete strainData.created_at

        // 转换日期对象为字符串格式，避免数据库绑定错误
        if (strainData.onset_date instanceof Date) {
          strainData.onset_date = strainData.onset_date.toISOString().split('T')[0]
        }
        if (strainData.sampling_date instanceof Date) {
          strainData.sampling_date = strainData.sampling_date.toISOString().split('T')[0]
        }
        if (strainData.isolation_date instanceof Date) {
          strainData.isolation_date = strainData.isolation_date.toISOString().split('T')[0]
        }
        if (strainData.submission_date instanceof Date) {
          strainData.submission_date = strainData.submission_date.toISOString().split('T')[0]
        }

        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API保存
          if (strainForm.basic.id) {
            // 更新现有菌株
            await window.electronAPI.strains.update(strainForm.basic.id, strainData)
            ElMessage.success('菌株更新成功')
          } else {
            // 添加新菌株
            await window.electronAPI.strains.create(strainData)
            ElMessage.success('菌株添加成功')
          }
        } else {
          // 开发环境的内存存储
          // 检查菌株编号是否重复
          const existingStrain = strains.value.find(strain =>
            strain.strain_id === strainForm.basic.strain_id &&
            strain.id !== strainForm.basic.id
          )
          if (existingStrain) {
            ElMessage.error('菌株编号已存在，请使用其他编号')
            return
          }

          // 生成序号（如果是新菌株）
          let sequenceNumber = strainForm.basic.sequence_number
          if (!strainForm.basic.id) {
            // 新菌株，生成下一个序号
            const maxSequence = strains.value.length > 0
              ? Math.max(...strains.value.map(s => s.sequence_number || 0))
              : 0
            sequenceNumber = maxSequence + 1
          }

          const fullStrainData = {
            ...strainData,
            id: strainForm.basic.id || Date.now(),
            sequence_number: sequenceNumber,
            created_at: strainForm.basic.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          if (strainForm.basic.id) {
            // 更新现有菌株
            const index = strains.value.findIndex(strain => strain.id === strainForm.basic.id)
            if (index !== -1) {
              strains.value[index] = fullStrainData
            }
            ElMessage.success('菌株更新成功')
          } else {
            // 添加新菌株
            strains.value.push(fullStrainData)
            pagination.total = strains.value.length
            ElMessage.success('菌株添加成功')
          }

          // 保存到localStorage
          localStorage.setItem('pams_strains', JSON.stringify(strains.value))
        }

        strainDialogVisible.value = false
        await loadStrains()
      } catch (error) {
        console.error('保存菌株失败:', error)
        if (error.message) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error('保存失败，请检查表单信息')
        }
      }
    }

    // 系统配置选项
    const speciesOptions = computed(() => store.getters.activeSpeciesOptions)
    const regionOptions = computed(() => store.getters.activeRegionOptions)
    const sourceOptions = computed(() => store.getters.activeSourceOptions)
    const projectOptions = computed(() => store.getters.activeProjectOptions)
    const experimentTypeOptions = computed(() => store.getters.activeExperimentTypeOptions)

    // 处理选项变化，如果是新值则保存到系统配置
    const handleSpeciesChange = async (value) => {
      const existingOption = speciesOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveSpeciesOption', {
            value,
            label: value,
            description: '用户输入的菌种'
          })
        } catch (error) {
          console.error('保存菌种选项失败:', error)
        }
      }
    }

    const handleRegionChange = async (value) => {
      const existingOption = regionOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveRegionOption', {
            value,
            label: value,
            description: '用户输入的地区'
          })
        } catch (error) {
          console.error('保存地区选项失败:', error)
        }
      }
    }

    const handleSourceChange = async (value) => {
      const existingOption = sourceOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveSourceOption', {
            value,
            label: value,
            description: '用户输入的样本来源'
          })
        } catch (error) {
          console.error('保存样本来源选项失败:', error)
        }
      }
    }

    const handleExperimentTypeChange = async (value) => {
      const existingOption = experimentTypeOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveExperimentTypeOption', {
            value,
            label: value,
            category: 'custom'
          })
        } catch (error) {
          console.error('保存实验类型选项失败:', error)
        }
      }
    }

    const handleProjectSourceChange = async (value) => {
      const existingOption = projectOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveProjectOption', {
            value,
            label: value,
            description: '用户输入的项目来源'
          })
        } catch (error) {
          console.error('保存项目来源选项失败:', error)
        }
      }
    }

    // 快速搜索处理
    const handleQuickSearch = () => {
      // 搜索逻辑已在 filteredStrains 计算属性中处理
      // 这里可以添加防抖逻辑或其他处理
    }

    // 工具方法
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (error) {
        return '-'
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return '-'
      }
    }

    const getGenderColor = (gender) => {
      switch (gender) {
      case '男':
        return '#409EFF'
      case '女':
        return '#F56C6C'
      default:
        return '#909399'
      }
    }

    const getGenderIcon = (gender) => {
      switch (gender) {
      case '男':
        return MaleIcon
      case '女':
        return Woman
      default:
        return AvatarIcon
      }
    }

    const getFontAwesomeGenderIcon = (gender) => {
      switch (gender) {
      case '男':
        return 'mars'
      case '女':
        return 'venus'
      default:
        return 'genderless'
      }
    }

    // 键盘快捷键处理
    const handleKeydown = (event) => {
      // Ctrl/Cmd + N: 添加新菌株
      if ((event.ctrlKey || event.metaKey) && event.key === 'n' && canUpload.value) {
        event.preventDefault()
        addStrain()
      }
      // Ctrl/Cmd + F: 聚焦到快速搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        const searchInput = document.querySelector('.quick-search-input input')
        if (searchInput) {
          searchInput.focus()
        }
      }
      // Escape: 清空快速搜索
      if (event.key === 'Escape' && quickSearchText.value) {
        quickSearchText.value = ''
      }
    }

    onMounted(async () => {
      // 并行加载菌株数据和系统配置
      await Promise.all([
        loadStrains(),
        store.dispatch('loadSystemConfig')
      ])

      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeydown)
    })

    // 组件卸载时移除事件监听
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    // 权限控制
    const canUpload = computed(() => {
      return store.getters['permission/hasPermission']('strains.create') ||
             store.getters['permission/hasPermission']('strains.edit') ||
             store.getters['permission/isAdmin']
    })
    const isAdmin = computed(() => store.getters['permission/isAdmin'])

    return {
      loading,
      strains,
      filteredStrains,
      sortedStrains,
      paginatedStrains,
      selectedStrains,
      quickSearchText,
      sortConfig,
      handleSortChange,
      handleQuickSearch,
      filterForm,
      pagination,
      searchStrains,
      resetFilter,
      addStrain,
      importStrains,
      exportStrains,
      viewStrain,
      editStrain,
      deleteStrain,
      handleSelectionChange,
      batchDelete,
      handleSizeChange,
      handleCurrentChange,
      canUpload,
      isAdmin,
      // 系统配置选项
      speciesOptions,
      regionOptions,
      sourceOptions,
      projectOptions,
      experimentTypeOptions,
      handleSpeciesChange,
      handleRegionChange,
      handleSourceChange,
      handleProjectSourceChange,
      handleExperimentTypeChange,
      // 对话框相关
      strainDialogVisible,
      isEditMode,
      activeTab,
      basicFormRef,
      characteristicsFormRef,
      strainForm,
      basicFormRules,
      characteristicsFormRules,
      dialogTitle,
      closeDialog,
      saveStrain,
      // 导入相关
      importDialogVisible,
      importStep,
      selectedFile,
      fileFields,
      fieldMappingData,
      importData,
      validRecords,
      errorRecords,
      importedCount,
      importProgress,
      isImporting,
      uploadRef,
      handleFileChange,
      clearFile,
      canNextStep,
      nextStep,
      prevStep,
      finishImport,
      // 导出相关
      exportDialogVisible,
      exportFormat,
      exportLoading,
      performExport,
      // 工具方法
      formatDate,
      formatDateTime,
      getGenderColor,
      getGenderIcon,
      getFontAwesomeGenderIcon,
      // IconPark图标
      AddOne,
      UploadIcon,
      DownloadIcon,
      DeleteIcon,
      Search,
      People,
      MaleIcon,
      Woman,
      AvatarIcon,
      Baby,
      IdCard,
      MedicineBottle,
      TestTube,
      Microscope,
      Hospital,
      // Element Plus图标 (保留部分)
      Document,
      Edit,
      Close,
      CircleCheck,
      QuestionFilled,
      User,
      Location,
      Calendar,
      Files,
      InfoFilled,
      Clock,
      Timer,
      Finished,
      Top,
      Male,
      Female,
      Avatar,
      Loading
    }
  }
}
</script>

<style scoped>
.strains-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;

  h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
    color: #303133;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.content-area {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.toolbar .el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toolbar .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-section .el-form-item {
  margin-bottom: 16px;
}

.filter-section .el-button {
  border-radius: 6px;
  font-weight: 500;
}

/* 快速搜索样式 */
.quick-search {
  margin-bottom: 16px;
}

.quick-search-input {
  max-width: 400px;
}

.quick-search-input .el-input__inner {
  border-radius: 20px;
  padding-left: 40px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.quick-search-input .el-input__inner:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.table-section {
  margin-top: 20px;
}

.table-section .el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-section .el-table th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
}

.table-section .el-table td {
  padding: 12px 0;
}

.table-section .el-table .el-button {
  border-radius: 4px;
  font-size: 12px;
  padding: 4px 8px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 表单对话框样式 */
.el-dialog .el-form-item__label {
  font-weight: 600;
  color: #303133;
}

.el-dialog .el-input__inner,
.el-dialog .el-select .el-input__inner,
.el-dialog .el-date-editor .el-input__inner {
  border-radius: 6px;
}

.el-dialog .el-button {
  border-radius: 6px;
  font-weight: 500;
}

/* 状态标签样式 */
.el-tag {
  border-radius: 4px;
  font-weight: 500;
}

/* 工具提示样式 */
.el-tooltip__popper {
  border-radius: 6px;
  font-size: 12px;
}

/* 序号样式 */
.sequence-number {
  font-weight: 600;
  color: #606266;
  font-size: 14px;
}

/* 菌株编号单元格样式 */
.strain-id-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.strain-id-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.strain-icon {
  margin-right: 4px;
  color: #409EFF;
  font-size: 14px;
}

.strain-text {
  font-weight: 500;
  color: #303133;
}

.notes-icon {
  color: #909399;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.notes-icon:hover {
  color: #409EFF;
}

/* 日期图标样式 */
.date-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.date-icon {
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-icon:hover {
  transform: scale(1.2);
}

.date-icon-empty {
  opacity: 0.3;
  filter: grayscale(100%);
}

/* 样本信息图标样式 */
.patient-info-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.patient-info-icon {
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.patient-info-icon:hover {
  transform: scale(1.2);
}

.patient-info-icon-empty {
  opacity: 0.2;
  filter: grayscale(100%);
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-buttons .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 上传信息图标样式 */
.upload-info-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.upload-info-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-info-icon:hover {
  transform: scale(1.2);
  filter: brightness(1.2);
}

.upload-info-icon-empty {
  opacity: 0.5;
  filter: grayscale(100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 8px;
  }

  .filter-section .el-form {
    flex-direction: column;
  }

  .filter-section .el-form-item {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .quick-search-input {
    max-width: 100%;
  }

  .table-section .el-table {
    font-size: 12px;
  }

  .action-buttons {
    gap: 4px;
  }

  .action-buttons .el-button {
    width: 28px;
    height: 28px;
  }
}

/* 打印样式 */
@media print {
  .toolbar,
  .filter-section,
  .pagination {
    display: none;
  }

  .table-section .el-table {
    border: 1px solid #000;
  }

  .action-buttons {
    display: none;
  }
}

/* 导入对话框样式 */
.import-steps {
  margin-bottom: 30px;
}

.import-step-content {
  margin-top: 20px;
}

.file-upload-area {
  .upload-content {
    padding: 40px;
    text-align: center;
  }

  .selected-file {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #f5f7fa;

    .file-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        flex: 1;
        margin-left: 10px;
      }
    }
  }
}

.field-mapping {
  h4 {
    margin-bottom: 10px;
    color: #303133;
  }

  p {
    margin-bottom: 20px;
    color: #606266;
  }

  .required {
    color: #f56c6c;
    margin-left: 5px;
  }
}

.data-validation {
  h4 {
    margin-bottom: 20px;
    color: #303133;
  }

  .validation-summary {
    display: flex;
    gap: 30px;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        font-weight: 500;
        color: #606266;
      }

      .value {
        font-weight: 600;
        font-size: 16px;

        &.success {
          color: #67c23a;
        }

        &.error {
          color: #f56c6c;
        }
      }
    }
  }

  .error-list {
    h5 {
      margin-bottom: 10px;
      color: #f56c6c;
    }
  }
}

.import-result {
  text-align: center;
  padding: 40px;

  .importing-status {
    .progress-icon {
      margin-bottom: 20px;

      .rotating {
        animation: rotate 2s linear infinite;
      }
    }

    .progress-container {
      margin-top: 30px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;

      .progress-text {
        margin-top: 10px;
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .import-completed {
    .result-icon {
      margin-bottom: 20px;
    }
  }

  h4 {
    margin-bottom: 10px;
    color: #303133;
  }

  p {
    color: #606266;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.import-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
