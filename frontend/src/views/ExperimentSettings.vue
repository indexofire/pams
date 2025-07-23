<template>
  <div class="experiment-settings-container">
    <div class="page-header">
      <h1>实验设置</h1>
      <p>管理实验相关的配置信息</p>
    </div>

    <div class="content-area">
      <!-- 实验相关设置区块 -->
      <div class="settings-section">
        <el-tabs v-model="activeTab" type="card" class="experiment-tabs">
          <!-- 菌种管理 -->
          <el-tab-pane label="菌种管理" name="species">
            <div class="species-management">
              <div class="toolbar">
                <div class="toolbar-left">
                  <el-button type="primary" @click="addSpecies">
                    <el-icon><Plus /></el-icon>
                    添加菌种
                  </el-button>
                </div>
                <div class="toolbar-right">
                  <el-button
                    type="success"
                    :disabled="selectedSpecies.length === 0"
                    @click="exportSelectedSpecies"
                  >
                    <el-icon><Download /></el-icon>
                    导出选中 ({{ selectedSpecies.length }})
                  </el-button>
                  <el-button type="warning" @click="importSpecies">
                    <el-icon><Upload /></el-icon>
                    导入菌种
                  </el-button>
                </div>
              </div>

              <el-table
                :data="paginatedSpecies"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
                @selection-change="handleSpeciesSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="菌种名称" min-width="120" />
                <el-table-column prop="scientific_name" label="学名" width="180">
                  <template #default="scope">
                    <em>{{ scope.row.scientific_name }}</em>
                  </template>
                </el-table-column>
                <el-table-column prop="abbreviation" label="缩写" width="80" />
                <el-table-column prop="ncbi_txid" label="NCBI TXID" width="100">
                  <template #default="scope">
                    <span v-if="scope.row.ncbi_txid">
                      <a :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${scope.row.ncbi_txid}`"
                         target="_blank"
                         style="color: #409eff; text-decoration: none;">
                        {{ scope.row.ncbi_txid }}
                      </a>
                    </span>
                    <span v-else style="color: #909399;">-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="150" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editSpecies(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleSpeciesStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteSpecies(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 菌种管理分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="speciesPagination.current"
                  v-model:page-size="speciesPagination.size"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="speciesPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSpeciesSizeChange"
                  @current-change="handleSpeciesPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <!-- 地区管理 -->
          <el-tab-pane label="地区管理" name="regions">
            <div class="region-management">
              <div class="toolbar">
                <div class="toolbar-left">
                  <el-button type="primary" @click="addRegion">
                    <el-icon><Plus /></el-icon>
                    添加地区
                  </el-button>
                </div>
                <div class="toolbar-right">
                  <el-button
                    type="success"
                    :disabled="selectedRegions.length === 0"
                    @click="exportSelectedRegions"
                  >
                    <el-icon><Download /></el-icon>
                    导出选中 ({{ selectedRegions.length }})
                  </el-button>
                  <el-button type="warning" @click="importRegions">
                    <el-icon><Upload /></el-icon>
                    导入地区
                  </el-button>
                </div>
              </div>

              <el-table
                :data="paginatedRegions"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
                @selection-change="handleRegionsSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="地区名称" min-width="150" />
                <el-table-column prop="code" label="地区代码" width="120" />
                <el-table-column prop="level" label="级别" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.level === 'province' ? 'danger' : scope.row.level === 'city' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ scope.row.level === 'province' ? '省/直辖市' : scope.row.level === 'city' ? '市' : '区/县' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editRegion(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleRegionStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteRegion(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 地区管理分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="regionPagination.current"
                  v-model:page-size="regionPagination.size"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="regionPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleRegionSizeChange"
                  @current-change="handleRegionPageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <!-- 样本来源管理 -->
          <el-tab-pane label="样本来源管理" name="sources">
            <div class="source-management">
              <div class="toolbar">
                <div class="toolbar-left">
                  <el-button type="primary" @click="addSource">
                    <el-icon><Plus /></el-icon>
                    添加样本来源
                  </el-button>
                </div>
                <div class="toolbar-right">
                  <el-button
                    type="success"
                    :disabled="selectedSources.length === 0"
                    @click="exportSelectedSources"
                  >
                    <el-icon><Download /></el-icon>
                    导出选中 ({{ selectedSources.length }})
                  </el-button>
                  <el-button type="warning" @click="importSources">
                    <el-icon><Upload /></el-icon>
                    导入样本来源
                  </el-button>
                </div>
              </div>

              <el-table
                :data="paginatedSources"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
                @selection-change="handleSourcesSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="来源名称" min-width="150" />
                <el-table-column prop="category" label="类别" width="120">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.category === 'clinical' ? 'danger' : scope.row.category === 'environmental' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ scope.row.category === 'clinical' ? '临床' : scope.row.category === 'environmental' ? '环境' : '其他' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editSource(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleSourceStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteSource(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 样本来源管理分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="sourcePagination.current"
                  v-model:page-size="sourcePagination.size"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="sourcePagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSourceSizeChange"
                  @current-change="handleSourcePageChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <!-- 实验类型管理 -->
          <el-tab-pane label="实验类型管理" name="experiments">
            <div class="experiment-management">
              <div class="toolbar">
                <div class="toolbar-left">
                  <el-button type="primary" @click="addExperiment">
                    <el-icon><Plus /></el-icon>
                    添加实验类型
                  </el-button>
                </div>
                <div class="toolbar-right">
                  <el-button
                    type="success"
                    :disabled="selectedExperiments.length === 0"
                    @click="exportSelectedExperiments"
                  >
                    <el-icon><Download /></el-icon>
                    导出选中 ({{ selectedExperiments.length }})
                  </el-button>
                  <el-button type="warning" @click="importExperiments">
                    <el-icon><Upload /></el-icon>
                    导入实验类型
                  </el-button>
                </div>
              </div>

              <el-table
                :data="paginatedExperiments"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
                @selection-change="handleExperimentsSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="实验名称" min-width="150" />
                <el-table-column label="实验数据" min-width="200">
                  <template #default="scope">
                    <div v-if="scope.row.experimentData && scope.row.experimentData.length > 0">
                      <el-tag
                        v-for="data in scope.row.experimentData"
                        :key="data.name"
                        :type="getDataTypeTagType(data.type)"
                        size="small"
                        style="margin-right: 5px; margin-bottom: 2px;"
                      >
                        {{ data.name }}({{ getDataTypeLabel(data.type) }})
                      </el-tag>
                    </div>
                    <span v-else style="color: #909399;">-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="实验描述" min-width="180" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editExperiment(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleExperimentStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteExperiment(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 实验类型管理分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="experimentPagination.current"
                  v-model:page-size="experimentPagination.size"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="experimentPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleExperimentSizeChange"
                  @current-change="handleExperimentPageChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>

    <!-- 菌种编辑对话框 -->
    <el-dialog v-model="speciesDialogVisible" title="菌种管理" width="700px">
      <el-form :model="speciesForm" label-width="100px">
        <el-form-item label="菌种名称" required>
          <el-input v-model="speciesForm.name" placeholder="请输入菌种名称" />
        </el-form-item>
        <el-form-item label="学名" required>
          <el-input
            v-model="speciesForm.scientific_name"
            placeholder="请输入学名，如：Escherichia coli"
            @blur="onScientificNameChange"
          />
        </el-form-item>
        <el-form-item label="缩写">
          <el-input
            v-model="speciesForm.abbreviation"
            placeholder="自动生成或手动输入"
            style="width: 200px;"
          >
            <template #append>
              <el-button @click="generateAbbreviation" :loading="abbreviationLoading">
                自动生成
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="NCBI TXID">
          <el-input
            v-model="speciesForm.ncbi_txid"
            placeholder="从NCBI获取或手动输入"
            style="width: 200px;"
          >
            <template #append>
              <el-button @click="searchNCBITaxonomy" :loading="ncbiLoading">
                从NCBI获取
              </el-button>
            </template>
          </el-input>
          <div v-if="ncbiSearchResult" class="ncbi-result" style="margin-top: 8px;">
            <el-alert
              :type="ncbiSearchResult.success ? 'success' : 'error'"
              :title="ncbiSearchResult.success ? 'NCBI信息获取成功' : 'NCBI信息获取失败'"
              :description="ncbiSearchResult.success ?
                `TXID: ${ncbiSearchResult.txid}, 学名: ${ncbiSearchResult.scientificName}` :
                ncbiSearchResult.error"
              show-icon
              :closable="false"
            />
          </div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="speciesForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="speciesForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="speciesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpecies">确定</el-button>
      </template>
    </el-dialog>

    <!-- 地区编辑对话框 -->
    <el-dialog v-model="regionDialogVisible" title="地区管理" width="600px">
      <el-form :model="regionForm" label-width="80px">
        <el-form-item label="地区名称">
          <el-input v-model="regionForm.name" placeholder="请输入地区名称" />
        </el-form-item>
        <el-form-item label="地区代码">
          <el-input v-model="regionForm.code" placeholder="请输入地区代码" />
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="regionForm.level" placeholder="请选择级别">
            <el-option label="省/直辖市" value="province" />
            <el-option label="市" value="city" />
            <el-option label="区/县" value="district" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="regionForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="regionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRegion">确定</el-button>
      </template>
    </el-dialog>

    <!-- 样本来源编辑对话框 -->
    <el-dialog v-model="sourceDialogVisible" title="样本来源管理" width="600px">
      <el-form :model="sourceForm" label-width="80px">
        <el-form-item label="来源名称">
          <el-input v-model="sourceForm.name" placeholder="请输入样本来源名称" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="sourceForm.category" placeholder="请选择类别">
            <el-option label="临床" value="clinical" />
            <el-option label="食品" value="food" />
            <el-option label="环境" value="environmental" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="sourceForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="sourceForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSource">确定</el-button>
      </template>
    </el-dialog>

    <!-- 实验类型编辑对话框 -->
    <el-dialog v-model="experimentDialogVisible" title="实验类型管理" width="1200px" top="5vh">
      <el-form :model="experimentForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实验名称" required>
              <el-input v-model="experimentForm.name" placeholder="请输入实验名称，如：三重PCR" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="experimentForm.status">
                <el-radio label="active">启用</el-radio>
                <el-radio label="inactive">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="实验描述">
          <el-input v-model="experimentForm.description" type="textarea" :rows="2" placeholder="请输入实验描述" />
        </el-form-item>

        <!-- 实验数据设置 -->
        <el-form-item label="实验数据">
          <div class="experiment-data-settings">
            <div class="data-header">
              <div class="header-left">
                <span>配置实验数据项</span>
                <el-tag size="small" type="info" style="margin-left: 10px;">
                  共 {{ experimentForm.experimentData?.length || 0 }} 项
                </el-tag>
              </div>
              <div class="header-right">
                <el-button type="success" size="small" @click="showBatchAddDialog">
                  <el-icon><Plus /></el-icon>
                  批量添加
                </el-button>
                <el-button type="primary" size="small" @click="addExperimentData">
                  <el-icon><Plus /></el-icon>
                  添加单项
                </el-button>
              </div>
            </div>

            <div v-if="experimentForm.experimentData && experimentForm.experimentData.length > 0" class="data-list">
              <!-- 紧凑型表格显示 -->
              <el-table
                :data="experimentForm.experimentData"
                border
                size="small"
                max-height="400"
                style="width: 100%"
              >
                <el-table-column label="序号" type="index" width="60" align="center" />
                <el-table-column label="数据名称" min-width="120">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.name"
                      placeholder="如：gene1"
                      size="small"
                      @blur="validateDataName(row)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="数据类型" width="100">
                  <template #default="{ row }">
                    <el-select
                      v-model="row.type"
                      size="small"
                      style="width: 100%"
                      @change="onDataTypeChange(row)"
                    >
                      <el-option label="布尔型" value="boolean" />
                      <el-option label="数值型" value="numeric" />
                      <el-option label="字符型" value="string" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="配置" min-width="200">
                  <template #default="{ row }">
                    <!-- 布尔型配置 -->
                    <div v-if="row.type === 'boolean'" class="inline-config">
                      <el-input
                        v-model="row.positiveLabel"
                        placeholder="阳性标签"
                        size="small"
                        style="width: 45%; margin-right: 5%"
                      />
                      <el-input
                        v-model="row.negativeLabel"
                        placeholder="阴性标签"
                        size="small"
                        style="width: 45%"
                      />
                    </div>
                    <!-- 数值型配置 -->
                    <div v-else-if="row.type === 'numeric'" class="inline-config">
                      <el-input
                        v-model="row.unit"
                        placeholder="单位"
                        size="small"
                        style="width: 30%; margin-right: 3%"
                      />
                      <el-input-number
                        v-model="row.precision"
                        :min="0" :max="6"
                        size="small"
                        placeholder="精度"
                        style="width: 30%; margin-right: 3%"
                      />
                      <el-button
                        size="small"
                        type="text"
                        @click="editThresholds(row)"
                        style="width: 30%"
                      >
                        阈值设置
                      </el-button>
                    </div>
                    <!-- 字符型配置 -->
                    <div v-else-if="row.type === 'string'" class="inline-config">
                      <el-input-number
                        v-model="row.maxLength"
                        :min="1"
                        size="small"
                        placeholder="最大长度"
                        style="width: 45%; margin-right: 5%"
                      />
                      <el-select
                        v-model="row.format"
                        size="small"
                        style="width: 45%"
                      >
                        <el-option label="无限制" value="none" />
                        <el-option label="DNA序列" value="dna" />
                        <el-option label="RNA序列" value="rna" />
                        <el-option label="蛋白质序列" value="protein" />
                      </el-select>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="描述" min-width="120">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.description"
                      placeholder="描述"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button
                      type="danger"
                      size="small"
                      @click="removeExperimentData($index)"
                      :disabled="experimentForm.experimentData.length <= 1"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="no-data-message">
              <el-empty description="暂无实验数据项，请点击上方按钮添加" :image-size="80" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <el-text type="info" size="small">
              提示：数值型数据可点击"阈值设置"进行详细配置
            </el-text>
          </div>
          <div class="footer-right">
            <el-button @click="experimentDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveExperiment">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 阈值设置对话框 -->
    <el-dialog v-model="thresholdDialogVisible" title="阈值设置" width="800px">
      <div v-if="currentThresholdData">
        <div class="threshold-header">
          <h4>{{ currentThresholdData.name }} - 阈值判断规则</h4>
          <el-tag size="small">{{ currentThresholdData.unit || '无单位' }}</el-tag>
        </div>

        <el-table :data="currentThresholdData.thresholds" border size="small">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="条件" width="100">
            <template #default="{ row }">
              <el-select v-model="row.operator" size="small" style="width: 100%">
                <el-option label="<" value="lt" />
                <el-option label="<=" value="lte" />
                <el-option label=">" value="gt" />
                <el-option label=">=" value="gte" />
                <el-option label="=" value="eq" />
                <el-option label="范围" value="range" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数值" min-width="150">
            <template #default="{ row }">
              <el-input-number
                v-if="row.operator !== 'range'"
                v-model="row.value"
                size="small"
                style="width: 100%"
                :precision="currentThresholdData.precision || 0"
              />
              <div v-else class="range-inputs">
                <el-input-number
                  v-model="row.minValue"
                  placeholder="最小值"
                  size="small"
                  style="width: 45%"
                  :precision="currentThresholdData.precision || 0"
                />
                <span style="margin: 0 5%">~</span>
                <el-input-number
                  v-model="row.maxValue"
                  placeholder="最大值"
                  size="small"
                  style="width: 45%"
                  :precision="currentThresholdData.precision || 0"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="判断结果" width="100">
            <template #default="{ row }">
              <el-input v-model="row.result" placeholder="如：S" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="结果描述" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.resultDescription" placeholder="如：敏感" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                @click="removeThresholdRule(currentThresholdData, $index)"
                :disabled="currentThresholdData.thresholds.length <= 1"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 15px;">
          <el-button type="primary" size="small" @click="addThresholdRule(currentThresholdData)">
            <el-icon><Plus /></el-icon>
            添加阈值规则
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="thresholdDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 批量添加对话框 -->
    <el-dialog v-model="batchAddDialogVisible" title="批量添加数据项" width="600px">
      <el-form label-width="100px">
        <el-form-item label="数据类型">
          <el-radio-group v-model="batchAddForm.type">
            <el-radio label="boolean">布尔型</el-radio>
            <el-radio label="numeric">数值型</el-radio>
            <el-radio label="string">字符型</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="数据名称">
          <el-input
            v-model="batchAddForm.names"
            type="textarea"
            :rows="6"
            placeholder="请输入数据名称，每行一个，例如：&#10;gene1&#10;gene2&#10;gene3&#10;或者：&#10;ampC,blaCTX-M,blaTEM"
          />
          <div style="margin-top: 5px; color: #909399; font-size: 12px;">
            支持换行分隔或逗号分隔，系统会自动识别
          </div>
        </el-form-item>

        <el-form-item v-if="batchAddForm.type === 'boolean'" label="标签设置">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input v-model="batchAddForm.positiveLabel" placeholder="阳性标签，如：阳性" />
            </el-col>
            <el-col :span="12">
              <el-input v-model="batchAddForm.negativeLabel" placeholder="阴性标签，如：阴性" />
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item v-if="batchAddForm.type === 'numeric'" label="数值设置">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input v-model="batchAddForm.unit" placeholder="单位，如：mg/L" />
            </el-col>
            <el-col :span="12">
              <el-input-number v-model="batchAddForm.precision" :min="0" :max="6" placeholder="精度" style="width: 100%" />
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item v-if="batchAddForm.type === 'string'" label="字符设置">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input-number v-model="batchAddForm.maxLength" :min="1" placeholder="最大长度" style="width: 100%" />
            </el-col>
            <el-col :span="12">
              <el-select v-model="batchAddForm.format" placeholder="格式验证" style="width: 100%">
                <el-option label="无限制" value="none" />
                <el-option label="DNA序列" value="dna" />
                <el-option label="RNA序列" value="rna" />
                <el-option label="蛋白质序列" value="protein" />
              </el-select>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchAddDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="executeBatchAdd">确定添加</el-button>
      </template>
    </el-dialog>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Upload } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
export default {
  name: 'ExperimentSettings',
  components: {
    Plus,
    Download,
    Upload
  },
  setup () {
    const store = useStore()
    const activeTab = ref('species')

    // 菌种管理相关
    const speciesOptions = ref([])

    // 地区管理相关
    const regionOptions = ref([])

    // 样本来源管理相关
    const sourceOptions = ref([])

    // 实验管理相关
    const experimentTypes = ref([])

    // 选中项管理
    const selectedSpecies = ref([])
    const selectedRegions = ref([])
    const selectedSources = ref([])
    const selectedExperiments = ref([])

    // 对话框状态
    const speciesDialogVisible = ref(false)
    const regionDialogVisible = ref(false)
    const sourceDialogVisible = ref(false)
    const experimentDialogVisible = ref(false)
    const thresholdDialogVisible = ref(false)
    const batchAddDialogVisible = ref(false)

    // 阈值设置相关
    const currentThresholdData = ref(null)

    // 批量添加表单
    const batchAddForm = reactive({
      type: 'boolean',
      names: '',
      positiveLabel: '阳性',
      negativeLabel: '阴性',
      unit: '',
      precision: 2,
      maxLength: 255,
      format: 'none'
    })

    // 分页配置
    const speciesPagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const regionPagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const sourcePagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const experimentPagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    // NCBI相关状态
    const ncbiLoading = ref(false)
    const abbreviationLoading = ref(false)
    const ncbiSearchResult = ref(null)

    // 表单数据
    const speciesForm = reactive({
      id: null,
      name: '',
      scientific_name: '',
      abbreviation: '',
      ncbi_txid: '',
      description: '',
      status: 'active'
    })

    const regionForm = reactive({
      id: null,
      name: '',
      code: '',
      level: 'province',
      status: 'active'
    })

    const sourceForm = reactive({
      id: null,
      name: '',
      category: 'clinical',
      description: '',
      status: 'active'
    })

    const experimentForm = reactive({
      id: null,
      name: '',
      description: '',
      status: 'active',
      experimentData: [
        {
          name: '',
          type: 'boolean',
          description: '',
          // 布尔型配置
          positiveLabel: '阳性',
          negativeLabel: '阴性',
          // 数值型配置
          unit: '',
          precision: 0,
          hasThreshold: false,
          thresholds: [
            {
              operator: 'lt',
              value: 2,
              result: 'S',
              resultDescription: '敏感'
            }
          ],
          // 字符型配置
          maxLength: 255,
          format: 'none'
        }
      ]
    })

    // 数据加载和保存方法
    const loadExperimentData = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          // 使用Electron API加载数据
          const species = await window.electronAPI.systemConfig.getSpecies()
          const regions = await window.electronAPI.systemConfig.getRegions()
          const sources = await window.electronAPI.systemConfig.getSampleSources()
          const experimentTypes = await window.electronAPI.systemConfig.getExperimentTypes()

          speciesOptions.value = species || []
          regionOptions.value = regions || []
          sourceOptions.value = sources || []
          experimentTypes.value = experimentTypes || []
        } else {
          // 开发环境：从localStorage加载数据
          const savedSpecies = localStorage.getItem('pams_species_options')
          const savedRegions = localStorage.getItem('pams_region_options')
          const savedSources = localStorage.getItem('pams_source_options')
          const savedExperiments = localStorage.getItem('pams_experiment_types')

          if (savedSpecies) {
            try {
              speciesOptions.value = JSON.parse(savedSpecies)
            } catch (e) {
              console.error('解析菌种数据失败:', e)
              speciesOptions.value = []
            }
          } else {
            speciesOptions.value = []
          }

          if (savedRegions) {
            try {
              regionOptions.value = JSON.parse(savedRegions)
            } catch (e) {
              console.error('解析地区数据失败:', e)
              regionOptions.value = []
            }
          } else {
            regionOptions.value = []
          }

          if (savedSources) {
            try {
              sourceOptions.value = JSON.parse(savedSources)
            } catch (e) {
              console.error('解析样本来源数据失败:', e)
              sourceOptions.value = []
            }
          } else {
            sourceOptions.value = []
          }

          if (savedExperiments) {
            try {
              experimentTypes.value = JSON.parse(savedExperiments)
            } catch (e) {
              console.error('解析实验类型数据失败:', e)
              experimentTypes.value = []
            }
          } else {
            experimentTypes.value = []
          }
        }
      } catch (error) {
        console.error('加载实验设置数据失败:', error)
        ElMessage.error('加载数据失败')
      }
    }

    const saveExperimentData = () => {
      try {
        // 保存到localStorage
        localStorage.setItem('pams_species_options', JSON.stringify(speciesOptions.value))
        localStorage.setItem('pams_region_options', JSON.stringify(regionOptions.value))
        localStorage.setItem('pams_source_options', JSON.stringify(sourceOptions.value))
        localStorage.setItem('pams_experiment_types', JSON.stringify(experimentTypes.value))
      } catch (error) {
        console.error('保存实验设置数据失败:', error)
      }
    }

    // NCBI相关方法
    const generateAbbreviation = async () => {
      if (!speciesForm.scientific_name) {
        ElMessage.warning('请先输入学名')
        return
      }

      abbreviationLoading.value = true
      try {
        if (window.electronAPI && window.electronAPI.ncbi) {
          const abbreviation = await window.electronAPI.ncbi.generateAbbreviation(speciesForm.scientific_name)
          speciesForm.abbreviation = abbreviation
          ElMessage.success('缩写生成成功')
        } else {
          // 浏览器环境下的简单生成逻辑
          const parts = speciesForm.scientific_name.trim().split(/\s+/)
          if (parts.length >= 2) {
            const genus = parts[0].charAt(0).toUpperCase()
            const species = parts[1].substring(0, 3).toLowerCase()
            speciesForm.abbreviation = genus + species
            ElMessage.success('缩写生成成功')
          }
        }
      } catch (error) {
        console.error('生成缩写失败:', error)
        ElMessage.error('生成缩写失败: ' + error.message)
      } finally {
        abbreviationLoading.value = false
      }
    }

    const searchNCBITaxonomy = async () => {
      if (!speciesForm.scientific_name) {
        ElMessage.warning('请先输入学名')
        return
      }

      ncbiLoading.value = true
      ncbiSearchResult.value = null

      try {
        if (window.electronAPI && window.electronAPI.ncbi) {
          const result = await window.electronAPI.ncbi.searchTaxonomyId(speciesForm.scientific_name)
          ncbiSearchResult.value = result

          if (result.success) {
            speciesForm.ncbi_txid = result.txid
            ElMessage.success('NCBI信息获取成功')
          } else {
            ElMessage.error('NCBI信息获取失败: ' + result.error)
          }
        } else {
          ElMessage.warning('NCBI功能仅在Electron环境下可用')
        }
      } catch (error) {
        console.error('搜索NCBI失败:', error)
        ElMessage.error('搜索NCBI失败: ' + error.message)
        ncbiSearchResult.value = {
          success: false,
          error: error.message
        }
      } finally {
        ncbiLoading.value = false
      }
    }

    const onScientificNameChange = () => {
      // 当学名改变时，清除之前的NCBI搜索结果
      ncbiSearchResult.value = null
    }

    // 菌种管理方法
    const addSpecies = () => {
      Object.assign(speciesForm, {
        id: null,
        name: '',
        scientific_name: '',
        abbreviation: '',
        ncbi_txid: '',
        description: '',
        status: 'active'
      })
      ncbiSearchResult.value = null
      speciesDialogVisible.value = true
    }

    // 生成新的ID
    const generateNewId = (dataArray) => {
      if (dataArray.length === 0) return 1
      const maxId = Math.max(...dataArray.map(item => item.id || 0))
      return maxId + 1
    }

    const editSpecies = (species) => {
      Object.assign(speciesForm, species)
      speciesDialogVisible.value = true
    }

    const saveSpecies = async () => {
      try {
        if (speciesForm.id && speciesForm.id !== null) {
          // 更新菌种
          const index = speciesOptions.value.findIndex(s => s.id === speciesForm.id)
          if (index !== -1) {
            speciesOptions.value[index] = { ...speciesForm }
          }

          // 同步更新store
          const storeData = {
            id: speciesForm.id,
            value: speciesForm.scientific_name || speciesForm.name,
            label: speciesForm.name,
            scientific_name: speciesForm.scientific_name,
            description: speciesForm.description,
            status: speciesForm.status
          }
          store.commit('UPDATE_SPECIES_OPTION', { id: speciesForm.id, species: storeData })
          ElMessage.success('菌种更新成功')
        } else {
          // 添加菌种 - 使用新的ID生成逻辑
          const newId = generateNewId(speciesOptions.value)
          const newSpecies = {
            ...speciesForm,
            id: newId
          }
          // 确保删除可能存在的null id
          delete newSpecies.id
          newSpecies.id = newId

          speciesOptions.value.push(newSpecies)

          // 同步添加到store
          const storeData = {
            id: newSpecies.id,
            value: newSpecies.scientific_name || newSpecies.name,
            label: newSpecies.name,
            scientific_name: newSpecies.scientific_name,
            description: newSpecies.description,
            status: newSpecies.status
          }
          store.commit('ADD_SPECIES_OPTION', storeData)
          ElMessage.success(`菌种添加成功，ID: ${newId}`)
        }

        // 保存到localStorage
        saveExperimentData()
        speciesDialogVisible.value = false
      } catch (error) {
        ElMessage.error('保存失败: ' + error.message)
      }
    }

    const deleteSpecies = (species) => {
      ElMessageBox.confirm('确定要删除该菌种吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = speciesOptions.value.findIndex(s => s.id === species.id)
        if (index !== -1) {
          speciesOptions.value.splice(index, 1)
        }
        // 同步删除store中的数据
        store.commit('DELETE_SPECIES_OPTION', species.id)
        // 保存到localStorage
        saveExperimentData()
        ElMessage.success('菌种删除成功')
      }).catch(() => {})
    }

    const toggleSpeciesStatus = (species) => {
      species.status = species.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`菌种已${species.status === 'active' ? '启用' : '禁用'}`)
    }

    // 地区管理方法
    const addRegion = () => {
      Object.assign(regionForm, { id: null, name: '', code: '', level: 'province', status: 'active' })
      regionDialogVisible.value = true
    }

    const editRegion = (region) => {
      Object.assign(regionForm, region)
      regionDialogVisible.value = true
    }

    const saveRegion = async () => {
      try {
        if (regionForm.id && regionForm.id !== null) {
          // 更新地区
          const index = regionOptions.value.findIndex(r => r.id === regionForm.id)
          if (index !== -1) {
            regionOptions.value[index] = { ...regionForm }
          }

          // 同步更新store
          const storeData = {
            id: regionForm.id,
            value: regionForm.name,
            label: regionForm.name,
            code: regionForm.code,
            level: regionForm.level,
            description: regionForm.description || '',
            status: regionForm.status
          }
          store.commit('UPDATE_REGION_OPTION', { id: regionForm.id, region: storeData })
          ElMessage.success('地区更新成功')
        } else {
          // 添加地区 - 使用新的ID生成逻辑
          const newId = generateNewId(regionOptions.value)
          const newRegion = {
            ...regionForm,
            id: newId
          }
          // 确保删除可能存在的null id
          delete newRegion.id
          newRegion.id = newId

          regionOptions.value.push(newRegion)

          // 同步添加到store
          const storeData = {
            id: newRegion.id,
            value: newRegion.name,
            label: newRegion.name,
            code: newRegion.code,
            level: newRegion.level,
            description: newRegion.description || '',
            status: newRegion.status
          }
          store.commit('ADD_REGION_OPTION', storeData)
          ElMessage.success(`地区添加成功，ID: ${newId}`)
        }

        // 保存到localStorage
        saveExperimentData()
        regionDialogVisible.value = false
      } catch (error) {
        ElMessage.error('保存失败: ' + error.message)
      }
    }

    const deleteRegion = (region) => {
      ElMessageBox.confirm('确定要删除该地区吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = regionOptions.value.findIndex(r => r.id === region.id)
        if (index !== -1) {
          regionOptions.value.splice(index, 1)
        }
        // 同步删除store中的数据
        store.commit('DELETE_REGION_OPTION', region.id)
        // 保存到localStorage
        saveExperimentData()
        ElMessage.success('地区删除成功')
      }).catch(() => {})
    }

    const toggleRegionStatus = (region) => {
      region.status = region.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`地区已${region.status === 'active' ? '启用' : '禁用'}`)
    }

    // 样本来源管理方法
    const addSource = () => {
      Object.assign(sourceForm, { id: null, name: '', category: 'clinical', description: '', status: 'active' })
      sourceDialogVisible.value = true
    }

    const editSource = (source) => {
      Object.assign(sourceForm, source)
      sourceDialogVisible.value = true
    }

    const saveSource = async () => {
      try {
        if (sourceForm.id && sourceForm.id !== null) {
          // 更新样本来源
          const index = sourceOptions.value.findIndex(s => s.id === sourceForm.id)
          if (index !== -1) {
            sourceOptions.value[index] = { ...sourceForm }
          }

          // 同步更新store
          const storeData = {
            id: sourceForm.id,
            value: sourceForm.name,
            label: sourceForm.name,
            category: sourceForm.category,
            description: sourceForm.description,
            status: sourceForm.status
          }
          store.commit('UPDATE_SOURCE_OPTION', { id: sourceForm.id, source: storeData })
          ElMessage.success('样本来源更新成功')
        } else {
          // 添加样本来源 - 使用新的ID生成逻辑
          const newId = generateNewId(sourceOptions.value)
          const newSource = {
            ...sourceForm,
            id: newId
          }
          // 确保删除可能存在的null id
          delete newSource.id
          newSource.id = newId

          sourceOptions.value.push(newSource)

          // 同步添加到store
          const storeData = {
            id: newSource.id,
            value: newSource.name,
            label: newSource.name,
            category: newSource.category,
            description: newSource.description,
            status: newSource.status
          }
          store.commit('ADD_SOURCE_OPTION', storeData)
          ElMessage.success(`样本来源添加成功，ID: ${newId}`)
        }

        // 保存到localStorage
        saveExperimentData()
        sourceDialogVisible.value = false
      } catch (error) {
        ElMessage.error('保存失败: ' + error.message)
      }
    }

    const deleteSource = (source) => {
      ElMessageBox.confirm('确定要删除该样本来源吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = sourceOptions.value.findIndex(s => s.id === source.id)
        if (index !== -1) {
          sourceOptions.value.splice(index, 1)
        }
        // 同步删除store中的数据
        store.commit('DELETE_SOURCE_OPTION', source.id)
        // 保存到localStorage
        saveExperimentData()
        ElMessage.success('样本来源删除成功')
      }).catch(() => {})
    }

    const toggleSourceStatus = (source) => {
      source.status = source.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`样本来源已${source.status === 'active' ? '启用' : '禁用'}`)
    }

    // 实验类型管理方法
    const addExperiment = () => {
      Object.assign(experimentForm, {
        id: null,
        name: '',
        description: '',
        status: 'active',
        experimentData: [
          {
            name: '',
            type: 'boolean',
            description: '',
            // 布尔型配置
            positiveLabel: '阳性',
            negativeLabel: '阴性',
            // 数值型配置
            unit: '',
            precision: 0,
            hasThreshold: false,
            thresholds: [
              {
                operator: 'lt',
                value: 2,
                result: 'S',
                resultDescription: '敏感'
              }
            ],
            // 字符型配置
            maxLength: 255,
            format: 'none'
          }
        ]
      })
      experimentDialogVisible.value = true
    }

    const editExperiment = (experiment) => {
      Object.assign(experimentForm, {
        ...experiment,
        experimentData: experiment.experimentData
          ? [...experiment.experimentData]
          : [
            {
              name: '',
              type: 'boolean',
              description: '',
              positiveLabel: '阳性',
              negativeLabel: '阴性',
              unit: '',
              precision: 0,
              hasThreshold: false,
              thresholds: [
                {
                  operator: 'lt',
                  value: 2,
                  result: 'S',
                  resultDescription: '敏感'
                }
              ],
              maxLength: 255,
              format: 'none'
            }
          ]
      })
      experimentDialogVisible.value = true
    }

    // 实验数据管理方法
    const addExperimentData = () => {
      experimentForm.experimentData.push({
        name: '',
        type: 'boolean',
        description: '',
        // 布尔型配置
        positiveLabel: '阳性',
        negativeLabel: '阴性',
        // 数值型配置
        unit: '',
        precision: 0,
        hasThreshold: false,
        thresholds: [
          {
            operator: 'lt',
            value: 2,
            result: 'S',
            resultDescription: '敏感'
          }
        ],
        // 字符型配置
        maxLength: 255,
        format: 'none'
      })
    }

    const removeExperimentData = (index) => {
      if (experimentForm.experimentData.length > 1) {
        experimentForm.experimentData.splice(index, 1)
      }
    }

    const onDataTypeChange = (dataItem) => {
      // 当数据类型改变时，重置相关配置
      if (dataItem.type === 'numeric') {
        dataItem.hasThreshold = false
        dataItem.thresholds = [
          {
            operator: 'lt',
            value: 2,
            result: 'S',
            resultDescription: '敏感'
          }
        ]
      }
    }

    const onThresholdToggle = (dataItem) => {
      if (!dataItem.hasThreshold) {
        dataItem.thresholds = []
      } else {
        dataItem.thresholds = [
          {
            operator: 'lt',
            value: 2,
            result: 'S',
            resultDescription: '敏感'
          }
        ]
      }
    }

    const addThresholdRule = (dataItem) => {
      dataItem.thresholds.push({
        operator: 'lt',
        value: 0,
        result: '',
        resultDescription: ''
      })
    }

    const removeThresholdRule = (dataItem, index) => {
      if (dataItem.thresholds.length > 1) {
        dataItem.thresholds.splice(index, 1)
      }
    }

    // 新增方法：编辑阈值
    const editThresholds = (dataItem) => {
      currentThresholdData.value = dataItem
      thresholdDialogVisible.value = true
    }

    // 新增方法：显示批量添加对话框
    const showBatchAddDialog = () => {
      // 重置表单
      Object.assign(batchAddForm, {
        type: 'boolean',
        names: '',
        positiveLabel: '阳性',
        negativeLabel: '阴性',
        unit: '',
        precision: 2,
        maxLength: 255,
        format: 'none'
      })
      batchAddDialogVisible.value = true
    }

    // 新增方法：执行批量添加
    const executeBatchAdd = () => {
      if (!batchAddForm.names.trim()) {
        ElMessage.warning('请输入数据名称')
        return
      }

      // 解析数据名称（支持换行分隔或逗号分隔）
      let names = []
      if (batchAddForm.names.includes('\n')) {
        names = batchAddForm.names.split('\n').map(name => name.trim()).filter(name => name)
      } else if (batchAddForm.names.includes(',')) {
        names = batchAddForm.names.split(',').map(name => name.trim()).filter(name => name)
      } else {
        names = [batchAddForm.names.trim()]
      }

      if (names.length === 0) {
        ElMessage.warning('请输入有效的数据名称')
        return
      }

      // 检查重复名称
      const existingNames = experimentForm.experimentData.map(item => item.name)
      const duplicateNames = names.filter(name => existingNames.includes(name))
      if (duplicateNames.length > 0) {
        ElMessage.warning(`以下名称已存在：${duplicateNames.join(', ')}`)
        return
      }

      // 批量添加数据项
      names.forEach(name => {
        const newDataItem = {
          name: name,
          type: batchAddForm.type,
          description: ''
        }

        // 根据类型设置默认配置
        if (batchAddForm.type === 'boolean') {
          newDataItem.positiveLabel = batchAddForm.positiveLabel || '阳性'
          newDataItem.negativeLabel = batchAddForm.negativeLabel || '阴性'
        } else if (batchAddForm.type === 'numeric') {
          newDataItem.unit = batchAddForm.unit || ''
          newDataItem.precision = batchAddForm.precision || 2
          newDataItem.hasThreshold = false
          newDataItem.thresholds = [{
            operator: 'gte',
            value: 0,
            result: '',
            resultDescription: ''
          }]
        } else if (batchAddForm.type === 'string') {
          newDataItem.maxLength = batchAddForm.maxLength || 255
          newDataItem.format = batchAddForm.format || 'none'
        }

        experimentForm.experimentData.push(newDataItem)
      })

      ElMessage.success(`成功添加 ${names.length} 个数据项`)
      batchAddDialogVisible.value = false
    }

    // 新增方法：验证数据名称
    const validateDataName = (dataItem) => {
      if (!dataItem.name.trim()) {
        ElMessage.warning('数据名称不能为空')
        return false
      }

      // 检查重复名称
      const duplicateCount = experimentForm.experimentData.filter(item => item.name === dataItem.name).length
      if (duplicateCount > 1) {
        ElMessage.warning(`数据名称"${dataItem.name}"重复，请修改`)
        return false
      }

      return true
    }

    // 数据类型相关辅助方法
    const getDataTypeLabel = (type) => {
      switch (type) {
      case 'boolean': return '布尔型'
      case 'numeric': return '数值型'
      case 'string': return '字符型'
      default: return '未知'
      }
    }

    const getDataTypeTagType = (type) => {
      switch (type) {
      case 'boolean': return 'success'
      case 'numeric': return 'warning'
      case 'string': return 'info'
      default: return ''
      }
    }

    const saveExperiment = async () => {
      try {
        if (experimentForm.id && experimentForm.id !== null) {
          // 更新实验类型
          const index = experimentTypes.value.findIndex(e => e.id === experimentForm.id)
          if (index !== -1) {
            experimentTypes.value[index] = { ...experimentForm }
          }

          // 同步更新store
          const storeData = {
            id: experimentForm.id,
            value: experimentForm.name,
            label: experimentForm.name,
            description: experimentForm.description,
            protocol: experimentForm.protocol,
            status: experimentForm.status
          }
          store.commit('UPDATE_EXPERIMENT_TYPE_OPTION', { id: experimentForm.id, experimentType: storeData })
          ElMessage.success('实验类型更新成功')
        } else {
          // 添加实验类型 - 使用新的ID生成逻辑
          const newId = generateNewId(experimentTypes.value)
          const newExperiment = {
            ...experimentForm,
            id: newId
          }
          // 确保删除可能存在的null id
          delete newExperiment.id
          newExperiment.id = newId

          experimentTypes.value.push(newExperiment)

          // 同步添加到store
          const storeData = {
            id: newExperiment.id,
            value: newExperiment.name,
            label: newExperiment.name,
            description: newExperiment.description,
            protocol: newExperiment.protocol,
            status: newExperiment.status
          }
          store.commit('ADD_EXPERIMENT_TYPE_OPTION', storeData)
          ElMessage.success(`实验类型添加成功，ID: ${newId}`)
        }

        // 保存到localStorage
        saveExperimentData()
        experimentDialogVisible.value = false
      } catch (error) {
        ElMessage.error('保存失败: ' + error.message)
      }
    }

    const deleteExperiment = (experiment) => {
      ElMessageBox.confirm('确定要删除该实验类型吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = experimentTypes.value.findIndex(e => e.id === experiment.id)
        if (index !== -1) {
          experimentTypes.value.splice(index, 1)
        }
        // 同步删除store中的数据
        store.commit('DELETE_EXPERIMENT_TYPE_OPTION', experiment.id)
        // 保存到localStorage
        saveExperimentData()
        ElMessage.success('实验类型删除成功')
      }).catch(() => {})
    }

    const toggleExperimentStatus = (experiment) => {
      experiment.status = experiment.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`实验类型已${experiment.status === 'active' ? '启用' : '禁用'}`)
    }

    // 获取参数精度
    const getParameterPrecision = (parameter) => {
      switch (parameter) {
      case 'gc_content':
        return 1
      case 'quality_score':
        return 1
      case 'coverage':
      case 'depth':
        return 0
      default:
        return 0
      }
    }

    // 获取类别标签类型
    const getCategoryTagType = (category) => {
      switch (category) {
      case 'genomics': return 'primary'
      case 'transcriptomics': return 'success'
      case 'proteomics': return 'warning'
      case 'metabolomics': return 'info'
      case 'microbiology': return 'danger'
      case 'immunology': return 'primary'
      case 'antimicrobial': return 'danger'
      case 'molecular_diagnosis': return 'warning'
      default: return 'info'
      }
    }

    // 获取类别标签文本
    const getCategoryLabel = (category) => {
      switch (category) {
      case 'genomics': return '基因组学'
      case 'transcriptomics': return '转录组学'
      case 'proteomics': return '蛋白质组学'
      case 'metabolomics': return '代谢组学'
      case 'microbiology': return '微生物学'
      case 'immunology': return '免疫学'
      case 'antimicrobial': return '药敏试验'
      case 'molecular_diagnosis': return '分子诊断'
      default: return '未知'
      }
    }

    // 获取阈值标签
    const getThresholdLabel = (parameter) => {
      switch (parameter) {
      case 'coverage': return '覆盖度'
      case 'depth': return '深度'
      case 'quality_score': return '质量分数'
      case 'gc_content': return 'GC含量'
      case 'n50': return 'N50值'
      case 'contigs_count': return 'Contigs数'
      case 'genome_size': return '基因组大小'
      case 'resistance_genes': return '抗性基因'
      case 'virulence_factors': return '毒力因子'
      case 'snp_count': return 'SNP数量'
      default: return parameter
      }
    }

    // 格式化阈值值
    const formatThresholdValue = (parameter, threshold) => {
      if (threshold.operator === 'range') {
        return `${threshold.minValue}-${threshold.maxValue} ${threshold.unit || ''}`
      } else {
        const operatorMap = {
          gt: '>',
          gte: '≥',
          lt: '<',
          lte: '≤',
          eq: '=',
          ne: '≠'
        }
        return `${operatorMap[threshold.operator] || threshold.operator} ${threshold.value} ${threshold.unit || ''}`
      }
    }

    // 更新分页总数的方法
    const updatePaginationTotals = () => {
      speciesPagination.total = speciesOptions.value.length
      regionPagination.total = regionOptions.value.length
      sourcePagination.total = sourceOptions.value.length
      experimentPagination.total = experimentTypes.value.length
    }

    // 分页数据计算属性
    const paginatedSpecies = computed(() => {
      const start = (speciesPagination.current - 1) * speciesPagination.size
      const end = start + speciesPagination.size
      return speciesOptions.value.slice(start, end)
    })

    const paginatedRegions = computed(() => {
      const start = (regionPagination.current - 1) * regionPagination.size
      const end = start + regionPagination.size
      return regionOptions.value.slice(start, end)
    })

    const paginatedSources = computed(() => {
      const start = (sourcePagination.current - 1) * sourcePagination.size
      const end = start + sourcePagination.size
      return sourceOptions.value.slice(start, end)
    })

    const paginatedExperiments = computed(() => {
      const start = (experimentPagination.current - 1) * experimentPagination.size
      const end = start + experimentPagination.size
      return experimentTypes.value.slice(start, end)
    })

    // 分页处理方法
    const handleSpeciesPageChange = (page) => {
      speciesPagination.current = page
    }

    const handleRegionPageChange = (page) => {
      regionPagination.current = page
    }

    const handleSourcePageChange = (page) => {
      sourcePagination.current = page
    }

    const handleExperimentPageChange = (page) => {
      experimentPagination.current = page
    }

    const handleSpeciesSizeChange = (size) => {
      speciesPagination.size = size
      speciesPagination.current = 1
    }

    const handleRegionSizeChange = (size) => {
      regionPagination.size = size
      regionPagination.current = 1
    }

    const handleSourceSizeChange = (size) => {
      sourcePagination.size = size
      sourcePagination.current = 1
    }

    const handleExperimentSizeChange = (size) => {
      experimentPagination.size = size
      experimentPagination.current = 1
    }

    // 页面加载时初始化数据
    // 选择变化处理方法
    const handleSpeciesSelectionChange = (selection) => {
      selectedSpecies.value = selection
    }

    const handleRegionsSelectionChange = (selection) => {
      selectedRegions.value = selection
    }

    const handleSourcesSelectionChange = (selection) => {
      selectedSources.value = selection
    }

    const handleExperimentsSelectionChange = (selection) => {
      selectedExperiments.value = selection
    }

    // 导出功能
    const exportSelectedSpecies = () => {
      if (selectedSpecies.value.length === 0) {
        ElMessage.warning('请先选择要导出的菌种')
        return
      }

      const exportData = selectedSpecies.value.map(item => ({
        name: item.name,
        scientific_name: item.scientific_name,
        abbreviation: item.abbreviation,
        ncbi_txid: item.ncbi_txid,
        description: item.description,
        status: item.status
      }))

      downloadJSON(exportData, `菌种数据_${new Date().toISOString().split('T')[0]}.json`)
      ElMessage.success(`成功导出 ${selectedSpecies.value.length} 条菌种数据`)
    }

    const exportSelectedRegions = () => {
      if (selectedRegions.value.length === 0) {
        ElMessage.warning('请先选择要导出的地区')
        return
      }

      const exportData = selectedRegions.value.map(item => ({
        name: item.name,
        code: item.code,
        level: item.level,
        description: item.description,
        status: item.status
      }))

      downloadJSON(exportData, `地区数据_${new Date().toISOString().split('T')[0]}.json`)
      ElMessage.success(`成功导出 ${selectedRegions.value.length} 条地区数据`)
    }

    const exportSelectedSources = () => {
      if (selectedSources.value.length === 0) {
        ElMessage.warning('请先选择要导出的样本来源')
        return
      }

      const exportData = selectedSources.value.map(item => ({
        name: item.name,
        category: item.category,
        description: item.description,
        status: item.status
      }))

      downloadJSON(exportData, `样本来源数据_${new Date().toISOString().split('T')[0]}.json`)
      ElMessage.success(`成功导出 ${selectedSources.value.length} 条样本来源数据`)
    }

    const exportSelectedExperiments = () => {
      if (selectedExperiments.value.length === 0) {
        ElMessage.warning('请先选择要导出的实验类型')
        return
      }

      const exportData = selectedExperiments.value.map(item => ({
        name: item.name,
        description: item.description,
        experimentData: item.experimentData,
        status: item.status
      }))

      downloadJSON(exportData, `实验类型数据_${new Date().toISOString().split('T')[0]}.json`)
      ElMessage.success(`成功导出 ${selectedExperiments.value.length} 条实验类型数据`)
    }

    // 下载JSON文件的工具方法
    const downloadJSON = (data, filename) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    // 验证菌种数据格式
    const validateSpeciesData = (item) => {
      const errors = []

      // 检查必需字段
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push('菌种名称不能为空')
      }

      // 检查可选字段的类型
      if (item.scientific_name && typeof item.scientific_name !== 'string') {
        errors.push('学名必须是字符串类型')
      }

      if (item.abbreviation && typeof item.abbreviation !== 'string') {
        errors.push('缩写必须是字符串类型')
      }

      if (item.ncbi_txid && (typeof item.ncbi_txid !== 'string' && typeof item.ncbi_txid !== 'number')) {
        errors.push('NCBI TXID必须是字符串或数字类型')
      }

      if (item.description && typeof item.description !== 'string') {
        errors.push('描述必须是字符串类型')
      }

      if (item.status && !['active', 'inactive'].includes(item.status)) {
        errors.push('状态必须是active或inactive')
      }

      return errors
    }

    // 导入功能
    const importSpecies = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const importData = JSON.parse(e.target.result)

              if (!Array.isArray(importData)) {
                ElMessage.error('导入文件格式错误，请确保是有效的JSON数组')
                return
              }

              if (importData.length === 0) {
                ElMessage.warning('导入文件为空，没有数据可导入')
                return
              }

              const validItems = []
              const invalidItems = []

              // 验证每个数据项
              importData.forEach((item, index) => {
                const errors = validateSpeciesData(item)
                if (errors.length === 0) {
                  // 标准化数据格式
                  const newSpecies = {
                    id: generateNewId(speciesOptions.value),
                    name: item.name.trim(),
                    scientific_name: item.scientific_name ? item.scientific_name.trim() : '',
                    abbreviation: item.abbreviation ? item.abbreviation.trim() : '',
                    ncbi_txid: item.ncbi_txid ? String(item.ncbi_txid) : '',
                    description: item.description ? item.description.trim() : '',
                    status: item.status || 'active'
                  }
                  validItems.push(newSpecies)
                } else {
                  invalidItems.push({
                    index: index + 1,
                    item: item,
                    errors: errors
                  })
                }
              })

              // 添加有效数据
              if (validItems.length > 0) {
                validItems.forEach(item => {
                  speciesOptions.value.push(item)
                })
                updatePaginationTotals()
              }

              // 显示结果
              if (invalidItems.length === 0) {
                ElMessage.success(`成功导入 ${validItems.length} 条菌种数据`)
              } else if (validItems.length === 0) {
                ElMessage.error(`导入失败，所有 ${invalidItems.length} 条数据都有格式错误`)
                console.error('导入错误详情:', invalidItems)
              } else {
                ElMessage.warning(`部分导入成功：${validItems.length} 条成功，${invalidItems.length} 条失败`)
                console.warn('导入错误详情:', invalidItems)
              }
            } catch (error) {
              console.error('JSON解析错误:', error)
              ElMessage.error(`导入文件解析失败：${error.message}`)
            }
          }
          reader.readAsText(file)
        }
      }
      input.click()
    }

    // 验证地区数据格式
    const validateRegionData = (item) => {
      const errors = []

      // 检查必需字段
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push('地区名称不能为空')
      }

      // 检查可选字段的类型
      if (item.code && typeof item.code !== 'string') {
        errors.push('地区代码必须是字符串类型')
      }

      if (item.level && !['province', 'city', 'district'].includes(item.level)) {
        errors.push('级别必须是province、city或district')
      }

      if (item.description && typeof item.description !== 'string') {
        errors.push('描述必须是字符串类型')
      }

      if (item.status && !['active', 'inactive'].includes(item.status)) {
        errors.push('状态必须是active或inactive')
      }

      return errors
    }

    const importRegions = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const importData = JSON.parse(e.target.result)

              if (!Array.isArray(importData)) {
                ElMessage.error('导入文件格式错误，请确保是有效的JSON数组')
                return
              }

              if (importData.length === 0) {
                ElMessage.warning('导入文件为空，没有数据可导入')
                return
              }

              const validItems = []
              const invalidItems = []

              // 验证每个数据项
              importData.forEach((item, index) => {
                const errors = validateRegionData(item)
                if (errors.length === 0) {
                  // 标准化数据格式
                  const newRegion = {
                    id: generateNewId(regionOptions.value),
                    name: item.name.trim(),
                    code: item.code ? item.code.trim() : '',
                    level: item.level || 'province',
                    description: item.description ? item.description.trim() : '',
                    status: item.status || 'active'
                  }
                  validItems.push(newRegion)
                } else {
                  invalidItems.push({
                    index: index + 1,
                    item: item,
                    errors: errors
                  })
                }
              })

              // 添加有效数据
              if (validItems.length > 0) {
                validItems.forEach(item => {
                  regionOptions.value.push(item)
                })
                updatePaginationTotals()
              }

              // 显示结果
              if (invalidItems.length === 0) {
                ElMessage.success(`成功导入 ${validItems.length} 条地区数据`)
              } else if (validItems.length === 0) {
                ElMessage.error(`导入失败，所有 ${invalidItems.length} 条数据都有格式错误`)
                console.error('导入错误详情:', invalidItems)
              } else {
                ElMessage.warning(`部分导入成功：${validItems.length} 条成功，${invalidItems.length} 条失败`)
                console.warn('导入错误详情:', invalidItems)
              }
            } catch (error) {
              console.error('JSON解析错误:', error)
              ElMessage.error(`导入文件解析失败：${error.message}`)
            }
          }
          reader.readAsText(file)
        }
      }
      input.click()
    }

    // 验证样本来源数据格式
    const validateSourceData = (item) => {
      const errors = []

      // 检查必需字段
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push('样本来源名称不能为空')
      }

      // 检查可选字段的类型
      if (item.category && !['clinical', 'environmental', 'food', 'other'].includes(item.category)) {
        errors.push('类别必须是clinical、environmental、food或other')
      }

      if (item.description && typeof item.description !== 'string') {
        errors.push('描述必须是字符串类型')
      }

      if (item.status && !['active', 'inactive'].includes(item.status)) {
        errors.push('状态必须是active或inactive')
      }

      return errors
    }

    const importSources = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const importData = JSON.parse(e.target.result)

              if (!Array.isArray(importData)) {
                ElMessage.error('导入文件格式错误，请确保是有效的JSON数组')
                return
              }

              if (importData.length === 0) {
                ElMessage.warning('导入文件为空，没有数据可导入')
                return
              }

              const validItems = []
              const invalidItems = []

              // 验证每个数据项
              importData.forEach((item, index) => {
                const errors = validateSourceData(item)
                if (errors.length === 0) {
                  // 标准化数据格式
                  const newSource = {
                    id: generateNewId(sourceOptions.value),
                    name: item.name.trim(),
                    category: item.category || 'other',
                    description: item.description ? item.description.trim() : '',
                    status: item.status || 'active'
                  }
                  validItems.push(newSource)
                } else {
                  invalidItems.push({
                    index: index + 1,
                    item: item,
                    errors: errors
                  })
                }
              })

              // 添加有效数据
              if (validItems.length > 0) {
                validItems.forEach(item => {
                  sourceOptions.value.push(item)
                })
                updatePaginationTotals()
              }

              // 显示结果
              if (invalidItems.length === 0) {
                ElMessage.success(`成功导入 ${validItems.length} 条样本来源数据`)
              } else if (validItems.length === 0) {
                ElMessage.error(`导入失败，所有 ${invalidItems.length} 条数据都有格式错误`)
                console.error('导入错误详情:', invalidItems)
              } else {
                ElMessage.warning(`部分导入成功：${validItems.length} 条成功，${invalidItems.length} 条失败`)
                console.warn('导入错误详情:', invalidItems)
              }
            } catch (error) {
              console.error('JSON解析错误:', error)
              ElMessage.error(`导入文件解析失败：${error.message}`)
            }
          }
          reader.readAsText(file)
        }
      }
      input.click()
    }

    // 验证实验数据项格式
    const validateExperimentDataItem = (dataItem) => {
      const errors = []

      if (!dataItem.name || typeof dataItem.name !== 'string' || dataItem.name.trim() === '') {
        errors.push('实验数据项名称不能为空')
      }

      if (!dataItem.type || !['boolean', 'numeric', 'string'].includes(dataItem.type)) {
        errors.push('实验数据项类型必须是boolean、numeric或string')
      }

      // 根据类型验证特定字段
      if (dataItem.type === 'boolean') {
        if (dataItem.positiveLabel && typeof dataItem.positiveLabel !== 'string') {
          errors.push('阳性标签必须是字符串类型')
        }
        if (dataItem.negativeLabel && typeof dataItem.negativeLabel !== 'string') {
          errors.push('阴性标签必须是字符串类型')
        }
      } else if (dataItem.type === 'numeric') {
        if (dataItem.unit && typeof dataItem.unit !== 'string') {
          errors.push('单位必须是字符串类型')
        }
        if (dataItem.precision && (typeof dataItem.precision !== 'number' || dataItem.precision < 0)) {
          errors.push('精度必须是非负数')
        }
        if (dataItem.thresholds && Array.isArray(dataItem.thresholds)) {
          dataItem.thresholds.forEach((threshold, index) => {
            if (!threshold.operator || !['lt', 'lte', 'gt', 'gte', 'eq', 'ne', 'range'].includes(threshold.operator)) {
              errors.push(`阈值${index + 1}的操作符无效`)
            }
            if (threshold.operator === 'range') {
              if (typeof threshold.minValue !== 'number' || typeof threshold.maxValue !== 'number') {
                errors.push(`阈值${index + 1}的范围值必须是数字`)
              }
            } else {
              if (typeof threshold.value !== 'number') {
                errors.push(`阈值${index + 1}的值必须是数字`)
              }
            }
          })
        }
      } else if (dataItem.type === 'string') {
        if (dataItem.maxLength && (typeof dataItem.maxLength !== 'number' || dataItem.maxLength <= 0)) {
          errors.push('最大长度必须是正数')
        }
        if (dataItem.format && !['none', 'dna', 'rna', 'protein'].includes(dataItem.format)) {
          errors.push('格式必须是none、dna、rna或protein')
        }
      }

      return errors
    }

    // 验证实验类型数据格式
    const validateExperimentData = (item) => {
      const errors = []

      // 检查必需字段
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        errors.push('实验名称不能为空')
      }

      if (item.description && typeof item.description !== 'string') {
        errors.push('描述必须是字符串类型')
      }

      if (item.status && !['active', 'inactive'].includes(item.status)) {
        errors.push('状态必须是active或inactive')
      }

      // 验证实验数据项
      if (item.experimentData) {
        if (!Array.isArray(item.experimentData)) {
          errors.push('实验数据必须是数组类型')
        } else {
          item.experimentData.forEach((dataItem, index) => {
            const dataErrors = validateExperimentDataItem(dataItem)
            dataErrors.forEach(error => {
              errors.push(`实验数据项${index + 1}: ${error}`)
            })
          })
        }
      }

      return errors
    }

    const importExperiments = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const importData = JSON.parse(e.target.result)

              if (!Array.isArray(importData)) {
                ElMessage.error('导入文件格式错误，请确保是有效的JSON数组')
                return
              }

              if (importData.length === 0) {
                ElMessage.warning('导入文件为空，没有数据可导入')
                return
              }

              const validItems = []
              const invalidItems = []

              // 验证每个数据项
              importData.forEach((item, index) => {
                const errors = validateExperimentData(item)
                if (errors.length === 0) {
                  // 标准化数据格式
                  const newExperiment = {
                    id: generateNewId(experimentTypes.value),
                    name: item.name.trim(),
                    description: item.description ? item.description.trim() : '',
                    experimentData: item.experimentData || [],
                    status: item.status || 'active'
                  }
                  validItems.push(newExperiment)
                } else {
                  invalidItems.push({
                    index: index + 1,
                    item: item,
                    errors: errors
                  })
                }
              })

              // 添加有效数据
              if (validItems.length > 0) {
                validItems.forEach(item => {
                  experimentTypes.value.push(item)
                })
                updatePaginationTotals()
              }

              // 显示结果
              if (invalidItems.length === 0) {
                ElMessage.success(`成功导入 ${validItems.length} 条实验类型数据`)
              } else if (validItems.length === 0) {
                ElMessage.error(`导入失败，所有 ${invalidItems.length} 条数据都有格式错误`)
                console.error('导入错误详情:', invalidItems)
              } else {
                ElMessage.warning(`部分导入成功：${validItems.length} 条成功，${invalidItems.length} 条失败`)
                console.warn('导入错误详情:', invalidItems)
              }
            } catch (error) {
              console.error('JSON解析错误:', error)
              ElMessage.error(`导入文件解析失败：${error.message}`)
            }
          }
          reader.readAsText(file)
        }
      }
      input.click()
    }

    onMounted(() => {
      loadExperimentData().then(() => {
        updatePaginationTotals()
      })
    })

    return {
      activeTab,
      // 数据加载和保存
      loadExperimentData,
      saveExperimentData,
      generateNewId,
      // 数据选项
      speciesOptions,
      regionOptions,
      sourceOptions,
      experimentTypes,
      // 选中项管理
      selectedSpecies,
      selectedRegions,
      selectedSources,
      selectedExperiments,
      // 对话框状态
      speciesDialogVisible,
      regionDialogVisible,
      sourceDialogVisible,
      experimentDialogVisible,
      thresholdDialogVisible,
      batchAddDialogVisible,
      // 阈值设置相关
      currentThresholdData,
      // 批量添加表单
      batchAddForm,
      // 表单数据
      speciesForm,
      regionForm,
      sourceForm,
      experimentForm,
      // NCBI相关状态和方法
      ncbiLoading,
      abbreviationLoading,
      ncbiSearchResult,
      generateAbbreviation,
      searchNCBITaxonomy,
      onScientificNameChange,
      // 菌种管理方法
      addSpecies,
      editSpecies,
      saveSpecies,
      deleteSpecies,
      toggleSpeciesStatus,
      // 地区管理方法
      addRegion,
      editRegion,
      saveRegion,
      deleteRegion,
      toggleRegionStatus,
      // 样本来源管理方法
      addSource,
      editSource,
      saveSource,
      deleteSource,
      toggleSourceStatus,
      // 实验类型管理方法
      addExperiment,
      editExperiment,
      saveExperiment,
      deleteExperiment,
      toggleExperimentStatus,
      // 实验数据管理方法
      addExperimentData,
      removeExperimentData,
      onDataTypeChange,
      onThresholdToggle,
      addThresholdRule,
      removeThresholdRule,
      editThresholds,
      showBatchAddDialog,
      executeBatchAdd,
      validateDataName,
      getDataTypeLabel,
      getDataTypeTagType,
      // 辅助方法
      getParameterPrecision,
      getCategoryTagType,
      getCategoryLabel,
      getThresholdLabel,
      formatThresholdValue,
      // 分页相关
      speciesPagination,
      regionPagination,
      sourcePagination,
      experimentPagination,
      paginatedSpecies,
      paginatedRegions,
      paginatedSources,
      paginatedExperiments,
      updatePaginationTotals,
      handleSpeciesPageChange,
      handleRegionPageChange,
      handleSourcePageChange,
      handleExperimentPageChange,
      handleSpeciesSizeChange,
      handleRegionSizeChange,
      handleSourceSizeChange,
      handleExperimentSizeChange,
      // 选择变化处理方法
      handleSpeciesSelectionChange,
      handleRegionsSelectionChange,
      handleSourcesSelectionChange,
      handleExperimentsSelectionChange,
      // 导出方法
      exportSelectedSpecies,
      exportSelectedRegions,
      exportSelectedSources,
      exportSelectedExperiments,
      // 导入方法
      importSpecies,
      importRegions,
      importSources,
      importExperiments,
      // 验证方法
      validateSpeciesData,
      validateRegionData,
      validateSourceData,
      validateExperimentData,
      validateExperimentDataItem
    }
  }
}
</script>

<style scoped>
.experiment-settings-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-section {
  padding: 24px;
}

.experiment-tabs {
  margin-top: 0;
}

.experiment-tabs .el-tabs__content {
  padding: 20px 0;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.toolbar .el-button {
  margin-right: 12px;
}

.toolbar .el-button:last-child {
  margin-right: 0;
}

.species-management,
.region-management,
.source-management,
.experiment-management {
  background: #fafafa;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.el-table {
  border-radius: 6px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.el-table td {
  padding: 12px 0;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 对话框样式 */
.el-dialog__header {
  background-color: #f5f7fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.el-dialog__title {
  font-weight: 600;
  color: #303133;
}

.el-dialog__body {
  padding: 24px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .experiment-settings-container {
    padding: 10px;
  }

  .page-header,
  .settings-section {
    padding: 16px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar .el-button {
    margin-bottom: 8px;
    margin-right: 0;
  }

  .el-table {
    font-size: 12px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 阈值设置样式 */
.threshold-settings {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background: #fafafa;
}

.threshold-row {
  margin-bottom: 10px;
  align-items: center;
}

.threshold-row:last-child {
  margin-bottom: 0;
}

.range-inputs {
  display: flex;
  align-items: center;
  width: 100%;
}

.threshold-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
}

.threshold-label {
  font-weight: 500;
  color: #606266;
  margin-right: 5px;
  min-width: 60px;
}

.threshold-value {
  color: #409eff;
  font-family: 'Courier New', monospace;
}

/* 实验数据设置样式 */
.experiment-data-settings {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background: #fafafa;
}

.data-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: 500;
  color: #606266;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 8px;
}

.inline-config {
  display: flex;
  align-items: center;
  gap: 5px;
}

.range-inputs {
  display: flex;
  align-items: center;
  width: 100%;
}

.threshold-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  flex: 1;
}

.footer-right {
  display: flex;
  gap: 10px;
}

.data-list {
  max-height: 500px;
  overflow-y: auto;
}

.data-item-card {
  margin-bottom: 15px;
}

.data-item-card:last-child {
  margin-bottom: 0;
}

.data-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.data-item-title {
  font-weight: 500;
  color: #409eff;
}

.boolean-config,
.numeric-config,
.string-config {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.threshold-config {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.threshold-rule {
  margin-bottom: 10px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}

.threshold-rule:last-child {
  margin-bottom: 0;
}

.range-inputs {
  display: flex;
  align-items: center;
  width: 100%;
}

.no-data-message {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.pagination-container .el-pagination {
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
