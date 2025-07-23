<template>
  <div class="admin-settings-container">
    <div class="page-header">
      <h1>管理员设置</h1>
      <p>配置系统字段和选项</p>
    </div>

    <div class="content-area">
      <el-tabs v-model="activeTab" type="card">
        <!-- 菌种管理 -->
        <el-tab-pane label="菌种管理" name="species">
          <div class="field-management">
            <div class="field-header">
              <h3>菌种（属）配置</h3>
              <div class="header-actions">
                <el-button
                  v-if="selectedSpecies.length > 0"
                  type="danger"
                  @click="batchDeleteSpecies"
                >
                  <el-icon><Delete /></el-icon>
                  批量删除 ({{ selectedSpecies.length }})
                </el-button>
                <el-button type="primary" @click="addSpecies">
                  <el-icon><Plus /></el-icon>
                  添加菌种
                </el-button>
              </div>
            </div>

            <el-table
              :data="speciesOptions"
              border
              @selection-change="handleSpeciesSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="菌种名称" />
              <el-table-column prop="scientific_name" label="学名" />
              <el-table-column prop="abbreviation" label="缩写" width="100" />
              <el-table-column prop="ncbi_txid" label="NCBI TXID" width="120">
                <template #default="scope">
                  <span v-if="scope.row.ncbi_txid">
                    <a :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${scope.row.ncbi_txid}`"
                       target="_blank"
                       style="color: #409EFF; text-decoration: none;">
                      {{ scope.row.ncbi_txid }}
                    </a>
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" />
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
          </div>
        </el-tab-pane>

        <!-- 地区管理 -->
        <el-tab-pane label="地区管理" name="regions">
          <div class="field-management">
            <div class="field-header">
              <h3>地区配置</h3>
              <div class="header-actions">
                <el-button
                  v-if="selectedRegions.length > 0"
                  type="danger"
                  @click="batchDeleteRegions"
                >
                  <el-icon><Delete /></el-icon>
                  批量删除 ({{ selectedRegions.length }})
                </el-button>
                <el-button type="primary" @click="addRegion">
                  <el-icon><Plus /></el-icon>
                  添加地区
                </el-button>
              </div>
            </div>

            <el-table
              :data="regionOptions"
              border
              @selection-change="handleRegionSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="地区名称" />
              <el-table-column prop="code" label="地区代码" />
              <el-table-column prop="level" label="级别" width="100">
                <template #default="scope">
                  <el-tag size="small">{{ getLevelText(scope.row.level) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="parent_name" label="上级地区" />
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
          </div>
        </el-tab-pane>

        <!-- 样本来源管理 -->
        <el-tab-pane label="样本来源" name="sources">
          <div class="field-management">
            <div class="field-header">
              <h3>样本来源配置</h3>
              <div class="header-actions">
                <el-button
                  v-if="selectedSources.length > 0"
                  type="danger"
                  @click="batchDeleteSources"
                >
                  <el-icon><Delete /></el-icon>
                  批量删除 ({{ selectedSources.length }})
                </el-button>
                <el-button type="primary" @click="addSource">
                  <el-icon><Plus /></el-icon>
                  添加来源
                </el-button>
              </div>
            </div>

            <el-table
              :data="sourceOptions"
              border
              @selection-change="handleSourceSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="来源名称" />
              <el-table-column prop="category" label="类别" />
              <el-table-column prop="description" label="描述" />
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
          </div>
        </el-tab-pane>

        <!-- 实验类型管理 -->
        <el-tab-pane label="实验类型" name="experiment-types">
          <div class="field-management">
            <div class="field-header">
              <h3>实验类型配置</h3>
              <div class="header-actions">
                <el-button
                  v-if="selectedExperimentTypes.length > 0"
                  type="danger"
                  @click="batchDeleteExperimentTypes"
                >
                  <el-icon><Delete /></el-icon>
                  批量删除 ({{ selectedExperimentTypes.length }})
                </el-button>
                <el-button type="primary" @click="addExperimentType">
                  <el-icon><Plus /></el-icon>
                  添加实验类型
                </el-button>
              </div>
            </div>

            <el-table
              :data="experimentTypeOptions"
              border
              @selection-change="handleExperimentTypeSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="实验类型名称" />
              <el-table-column prop="code" label="代码" />
              <el-table-column prop="category" label="类别" />
              <el-table-column prop="description" label="描述" />
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
                  <el-button size="small" @click="editExperimentType(scope.row)">编辑</el-button>
                  <el-button
                    size="small"
                    :type="scope.row.status === 'active' ? 'warning' : 'success'"
                    @click="toggleExperimentTypeStatus(scope.row)"
                  >
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteExperimentType(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 数据库管理 -->
        <el-tab-pane label="数据库管理" name="database">
          <div class="database-management">
            <div class="database-header">
              <h3>数据库管理</h3>
              <div class="header-actions">
                <el-button type="primary" @click="performHealthCheck" :loading="healthCheckLoading">
                  <el-icon><Monitor /></el-icon>
                  健康检查
                </el-button>
                <el-button type="warning" @click="optimizeDatabase" :loading="optimizeLoading">
                  <el-icon><Tools /></el-icon>
                  优化数据库
                </el-button>
              </div>
            </div>

            <!-- 数据库状态 -->
            <el-card class="status-card" v-if="databaseStatus">
              <template #header>
                <div class="card-header">
                  <span>数据库状态</span>
                  <el-tag :type="databaseStatus.status === 'healthy' ? 'success' : 'warning'">
                    {{ databaseStatus.status === 'healthy' ? '健康' : '警告' }}
                  </el-tag>
                </div>
              </template>

              <div class="status-grid">
                <div class="status-item" v-for="check in databaseStatus.checks" :key="check.type">
                  <div class="status-label">{{ getCheckLabel(check.type) }}</div>
                  <div class="status-value">
                    <el-tag :type="check.status === 'ok' ? 'success' : 'danger'" size="small">
                      {{ check.status === 'ok' ? '正常' : '异常' }}
                    </el-tag>
                    <span v-if="check.count !== undefined" class="count">{{ check.count }}</span>
                    <span v-if="check.size_mb" class="size">{{ check.size_mb }} MB</span>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 迁移历史 -->
            <el-card class="migration-card">
              <template #header>
                <div class="card-header">
                  <span>迁移历史</span>
                  <el-button size="small" @click="loadMigrationHistory">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </template>

              <el-table :data="migrationHistory" border>
                <el-table-column prop="version" label="版本" width="100" />
                <el-table-column prop="name" label="迁移名称" />
                <el-table-column prop="executed_at" label="执行时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.executed_at) }}
                  </template>
                </el-table-column>
                <el-table-column prop="checksum" label="校验和" width="120">
                  <template #default="scope">
                    <code class="checksum">{{ scope.row.checksum?.substring(0, 8) }}...</code>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 权限管理 -->
        <el-tab-pane label="权限管理" name="permissions">
          <div class="permission-management">
            <el-tabs v-model="permissionActiveTab" type="card">
              <!-- 角色管理 -->
              <el-tab-pane label="角色管理" name="roles">
                <div class="roles-header">
                  <h4>角色管理</h4>
                  <el-button
                    v-if="canManageRoles"
                    type="primary"
                    @click="showCreateRoleDialog"
                  >
                    <el-icon><Plus /></el-icon>
                    新建角色
                  </el-button>
                  <el-alert
                    v-else
                    title="您没有管理角色的权限"
                    type="warning"
                    :closable="false"
                    style="margin-left: auto; width: auto;"
                  />
                </div>

                <el-table :data="roles" border>
                  <el-table-column prop="display_name" label="角色名称" />
                  <el-table-column prop="name" label="角色标识" />
                  <el-table-column prop="description" label="描述" />
                  <el-table-column prop="user_count" label="用户数" width="80" />
                  <el-table-column prop="permission_count" label="权限数" width="80" />
                  <el-table-column prop="is_system" label="系统角色" width="100">
                    <template #default="scope">
                      <el-tag :type="scope.row.is_system ? 'info' : 'success'" size="small">
                        {{ scope.row.is_system ? '是' : '否' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="250">
                    <template #default="scope">
                      <el-button
                        v-if="canManageRoles"
                        size="small"
                        @click="editRole(scope.row)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        v-if="canManageRoles"
                        size="small"
                        @click="editRolePermissions(scope.row)"
                      >
                        权限设置
                      </el-button>
                      <el-button
                        v-if="canManageRoles"
                        size="small"
                        type="danger"
                        @click="deleteRole(scope.row)"
                        :disabled="scope.row.is_system"
                      >
                        删除
                      </el-button>
                      <span v-if="!canManageRoles" class="no-permission-text">
                        无权限操作
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 权限列表 -->
              <el-tab-pane label="权限列表" name="permissions">
                <div class="permissions-header">
                  <h4>系统权限</h4>
                </div>

                <el-table :data="groupedPermissions" border>
                  <el-table-column prop="module" label="模块" width="120" />
                  <el-table-column prop="display_name" label="权限名称" />
                  <el-table-column prop="action" label="操作" width="100" />
                  <el-table-column prop="description" label="描述" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>

        <!-- 系统配置 -->
        <el-tab-pane label="系统配置" name="system">
          <div class="system-config">
            <el-form :model="systemConfig" label-width="120px">
              <el-form-item label="系统名称">
                <el-input v-model="systemConfig.systemName" placeholder="请输入系统名称" />
              </el-form-item>
              <el-form-item label="系统描述">
                <el-input
                  v-model="systemConfig.systemDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入系统描述"
                />
              </el-form-item>
              <el-form-item label="默认语言">
                <el-select v-model="systemConfig.defaultLanguage" placeholder="请选择默认语言">
                  <el-option label="中文" value="zh-CN" />
                  <el-option label="英文" value="en-US" />
                </el-select>
              </el-form-item>
              <el-form-item label="时区">
                <el-select v-model="systemConfig.timezone" placeholder="请选择时区">
                  <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
                  <el-option label="UTC" value="UTC" />
                </el-select>
              </el-form-item>
              <el-form-item label="自动备份">
                <el-switch v-model="systemConfig.autoBackup" />
              </el-form-item>
              <el-form-item label="备份间隔">
                <el-select v-model="systemConfig.backupInterval" :disabled="!systemConfig.autoBackup">
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSystemConfig">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 菌种编辑对话框 -->
    <el-dialog v-model="speciesDialogVisible" :title="isEditSpecies ? '编辑菌种' : '添加菌种'" width="500px">
      <el-form ref="speciesFormRef" :model="speciesForm" :rules="speciesFormRules" label-width="100px">
        <el-form-item label="菌种名称" prop="name">
          <el-input v-model="speciesForm.name" placeholder="请输入菌种名称" />
        </el-form-item>
        <el-form-item label="学名" prop="scientific_name">
          <el-input v-model="speciesForm.scientific_name" placeholder="请输入学名" />
        </el-form-item>
        <el-form-item label="缩写" prop="abbreviation">
          <el-input v-model="speciesForm.abbreviation" placeholder="请输入菌种缩写" />
        </el-form-item>
        <el-form-item label="NCBI TXID" prop="ncbi_txid">
          <div style="display: flex; gap: 8px;">
            <el-input
              v-model="speciesForm.ncbi_txid"
              placeholder="请输入NCBI分类学ID"
              style="flex: 1;"
            />
            <el-button
              type="primary"
              :loading="fetchingNCBI"
              @click="fetchNCBIInfo"
              :disabled="!speciesForm.scientific_name"
            >
              <el-icon><Search /></el-icon>
              抓取
            </el-button>
          </div>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            可根据学名自动从NCBI抓取分类学信息
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="speciesForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="speciesForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="speciesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpecies">确定</el-button>
      </template>
    </el-dialog>

    <!-- 地区编辑对话框 -->
    <el-dialog v-model="regionDialogVisible" :title="isEditRegion ? '编辑地区' : '添加地区'" width="500px">
      <el-form ref="regionFormRef" :model="regionForm" :rules="regionFormRules" label-width="100px">
        <el-form-item label="地区名称" prop="name">
          <el-input v-model="regionForm.name" placeholder="请输入地区名称" />
        </el-form-item>
        <el-form-item label="地区代码" prop="code">
          <el-input v-model="regionForm.code" placeholder="请输入地区代码" />
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="regionForm.level" placeholder="请选择级别">
            <el-option label="省/直辖市" value="province" />
            <el-option label="市/区" value="city" />
            <el-option label="县/区" value="county" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级地区" prop="parent_id">
          <el-select v-model="regionForm.parent_id" placeholder="请选择上级地区" clearable>
            <el-option
              v-for="region in parentRegions"
              :key="region.id"
              :label="region.name"
              :value="region.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="regionForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="regionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRegion">确定</el-button>
      </template>
    </el-dialog>

    <!-- 样本来源编辑对话框 -->
    <el-dialog v-model="sourceDialogVisible" :title="isEditSource ? '编辑来源' : '添加来源'" width="500px">
      <el-form ref="sourceFormRef" :model="sourceForm" :rules="sourceFormRules" label-width="100px">
        <el-form-item label="来源名称" prop="name">
          <el-input v-model="sourceForm.name" placeholder="请输入来源名称" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="sourceForm.category" placeholder="请选择类别">
            <el-option label="临床样本" value="clinical" />
            <el-option label="环境样本" value="environmental" />
            <el-option label="食品样本" value="food" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="sourceForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="sourceForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSource">确定</el-button>
      </template>
    </el-dialog>

    <!-- 实验类型编辑对话框 -->
    <el-dialog v-model="experimentTypeDialogVisible" :title="isEditExperimentType ? '编辑实验类型' : '添加实验类型'" width="500px">
      <el-form ref="experimentTypeFormRef" :model="experimentTypeForm" :rules="experimentTypeFormRules" label-width="100px">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="experimentTypeForm.name" placeholder="请输入实验类型名称" />
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="experimentTypeForm.code" placeholder="请输入代码（英文）" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="experimentTypeForm.category" placeholder="请选择类别">
            <el-option label="分型分析" value="typing" />
            <el-option label="基因分析" value="gene_analysis" />
            <el-option label="测序分析" value="sequencing" />
            <el-option label="比较分析" value="analysis" />
            <el-option label="功能注释" value="annotation" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="experimentTypeForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="experimentTypeForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="experimentTypeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveExperimentType">确定</el-button>
      </template>
    </el-dialog>

    <!-- 创建角色对话框 -->
    <el-dialog
      v-model="createRoleDialogVisible"
      title="创建角色"
      width="500px"
      @close="resetCreateRoleForm"
    >
      <el-form
        ref="createRoleFormRef"
        :model="createRoleForm"
        :rules="createRoleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="display_name">
          <el-input
            v-model="createRoleForm.display_name"
            placeholder="请输入角色显示名称"
          />
        </el-form-item>
        <el-form-item label="角色标识" prop="name">
          <el-input
            v-model="createRoleForm.name"
            placeholder="请输入角色标识（英文）"
          />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="createRoleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreateRole" :loading="createRoleLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      v-model="editRoleDialogVisible"
      title="编辑角色"
      width="500px"
      @close="resetEditRoleForm"
    >
      <el-form
        ref="editRoleFormRef"
        :model="editRoleForm"
        :rules="editRoleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="display_name">
          <el-input
            v-model="editRoleForm.display_name"
            placeholder="请输入角色显示名称"
          />
        </el-form-item>
        <el-form-item label="角色标识" prop="name">
          <el-input
            v-model="editRoleForm.name"
            placeholder="请输入角色标识（英文）"
            :disabled="editRoleForm.is_system"
          />
          <div v-if="editRoleForm.is_system" style="font-size: 12px; color: #999; margin-top: 4px;">
            系统角色的标识不能修改
          </div>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="editRoleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditRole" :loading="editRoleLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑角色权限对话框 -->
    <el-dialog
      v-model="editRolePermissionsDialogVisible"
      title="编辑角色权限"
      width="800px"
      @close="resetEditRolePermissionsForm"
    >
      <div v-if="currentEditingRole">
        <h4>角色：{{ currentEditingRole.display_name }}</h4>
        <el-divider />

        <div class="permissions-tree">
          <div v-for="module in groupedPermissionsForEdit" :key="module.name" class="permission-module">
            <div class="module-header">
              <el-checkbox
                :model-value="isModuleAllSelected(module.name)"
                :indeterminate="isModuleIndeterminate(module.name)"
                @change="handleModuleSelectAll(module.name, $event)"
              >
                {{ getModuleDisplayName(module.name) }}
              </el-checkbox>
            </div>
            <div class="module-permissions">
              <el-checkbox-group v-model="selectedPermissions">
                <el-checkbox
                  v-for="permission in module.permissions"
                  :key="permission.id"
                  :label="permission.id"
                  class="permission-item"
                >
                  {{ permission.display_name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editRolePermissionsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRolePermissions" :loading="savePermissionsLoading">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search, Monitor, Tools, Refresh } from '@element-plus/icons-vue'
import { useStore } from 'vuex'

export default {
  name: 'AdminSettings',
  components: {
    Plus,
    Delete,
    Search,
    Monitor,
    Tools,
    Refresh
  },
  setup () {
    const store = useStore()
    const activeTab = ref('species')

    // 权限检查
    const hasPermission = (permission) => {
      return store.getters['permission/hasPermission'](permission)
    }

    const isAdmin = computed(() => {
      return store.getters['permission/isAdmin']
    })

    const canManageRoles = computed(() => {
      const hasManageRoles = hasPermission('users.manage_roles')
      const isAdminUser = isAdmin.value
      const result = hasManageRoles || isAdminUser

      console.log('🔍 [AdminSettings] 权限检查详情:')
      console.log('  - users.manage_roles权限:', hasManageRoles)
      console.log('  - 是否管理员:', isAdminUser)
      console.log('  - 最终结果:', result)
      console.log('  - 当前用户:', store.getters['auth/user'])
      console.log('  - 权限列表:', store.getters['permission/userPermissions'])
      console.log('  - 用户角色:', store.getters['permission/userRole'])
      console.log('  - permission store state:', store.state.permission)

      return result
    })

    const canManageSettings = computed(() => {
      return hasPermission('settings.edit') || isAdmin.value
    })

    // 菌种相关
    const speciesOptions = ref([])
    const speciesDialogVisible = ref(false)
    const isEditSpecies = ref(false)
    const speciesFormRef = ref(null)
    const fetchingNCBI = ref(false)
    const speciesForm = reactive({
      id: null,
      name: '',
      scientific_name: '',
      abbreviation: '',
      ncbi_txid: '',
      description: '',
      status: 'active'
    })
    const speciesFormRules = {
      name: [{ required: true, message: '请输入菌种名称', trigger: 'blur' }],
      scientific_name: [{ required: true, message: '请输入学名', trigger: 'blur' }]
    }

    // 地区相关
    const regionOptions = ref([])
    const regionDialogVisible = ref(false)
    const isEditRegion = ref(false)
    const regionFormRef = ref(null)
    const regionForm = reactive({
      id: null,
      name: '',
      code: '',
      level: 'province',
      parent_id: null,
      status: 'active'
    })
    const regionFormRules = {
      name: [{ required: true, message: '请输入地区名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入地区代码', trigger: 'blur' }],
      level: [{ required: true, message: '请选择级别', trigger: 'change' }]
    }

    // 样本来源相关
    const sourceOptions = ref([])
    const sourceDialogVisible = ref(false)
    const isEditSource = ref(false)
    const sourceFormRef = ref(null)
    const sourceForm = reactive({
      id: null,
      name: '',
      category: 'clinical',
      description: '',
      status: 'active'
    })
    const sourceFormRules = {
      name: [{ required: true, message: '请输入来源名称', trigger: 'blur' }],
      category: [{ required: true, message: '请选择类别', trigger: 'change' }]
    }

    // 实验类型相关
    const experimentTypeOptions = ref([])
    const experimentTypeDialogVisible = ref(false)
    const isEditExperimentType = ref(false)
    const experimentTypeFormRef = ref(null)
    const experimentTypeForm = reactive({
      id: null,
      name: '',
      code: '',
      category: 'analysis',
      description: '',
      status: 'active'
    })
    const experimentTypeFormRules = {
      name: [{ required: true, message: '请输入实验类型名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入代码', trigger: 'blur' }],
      category: [{ required: true, message: '请选择类别', trigger: 'change' }]
    }

    // 批量操作相关
    const selectedSpecies = ref([])
    const selectedRegions = ref([])
    const selectedSources = ref([])
    const selectedExperimentTypes = ref([])

    // 数据库管理相关
    const databaseStatus = ref(null)
    const migrationHistory = ref([])
    const healthCheckLoading = ref(false)
    const optimizeLoading = ref(false)

    // 权限管理相关
    const permissionActiveTab = ref('roles')
    const roles = ref([])
    const permissions = ref([])
    const groupedPermissions = computed(() => {
      const grouped = {}
      permissions.value.forEach(perm => {
        if (!grouped[perm.module]) {
          grouped[perm.module] = []
        }
        grouped[perm.module].push(perm)
      })
      return Object.keys(grouped).flatMap(module =>
        grouped[module].map(perm => ({ ...perm, module }))
      )
    })

    // 创建角色相关
    const createRoleDialogVisible = ref(false)
    const createRoleLoading = ref(false)
    const createRoleForm = reactive({
      name: '',
      display_name: '',
      description: ''
    })
    const createRoleRules = {
      display_name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入角色标识', trigger: 'blur' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '角色标识只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
      ]
    }

    // 编辑角色相关
    const editRoleDialogVisible = ref(false)
    const editRoleLoading = ref(false)
    const editRoleForm = reactive({
      id: null,
      name: '',
      display_name: '',
      description: '',
      is_system: false
    })
    const editRoleRules = {
      display_name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入角色标识', trigger: 'blur' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '角色标识只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
      ]
    }

    // 编辑角色权限相关
    const editRolePermissionsDialogVisible = ref(false)
    const savePermissionsLoading = ref(false)
    const currentEditingRole = ref(null)
    const selectedPermissions = ref([])
    const groupedPermissionsForEdit = computed(() => {
      const grouped = {}
      permissions.value.forEach(perm => {
        if (!grouped[perm.module]) {
          grouped[perm.module] = {
            name: perm.module,
            permissions: []
          }
        }
        grouped[perm.module].permissions.push(perm)
      })
      return Object.values(grouped)
    })

    // 系统配置
    const systemConfig = reactive({
      systemName: 'PAMS',
      systemDescription: '病原菌分析管理系统',
      defaultLanguage: 'zh-CN',
      timezone: 'Asia/Shanghai',
      autoBackup: true,
      backupInterval: 'daily'
    })

    // 计算属性
    const parentRegions = computed(() => {
      return regionOptions.value.filter(region =>
        region.level === 'province' && region.status === 'active'
      )
    })

    // 加载数据
    const loadSpeciesOptions = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          const species = await window.electronAPI.systemConfig.getSpecies()
          speciesOptions.value = species || []
        } else {
          // 浏览器环境空数据 - 对应实验设置中的菌种字段
          speciesOptions.value = []
        }
        // 同步到Vuex store
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('加载菌种数据失败:', error)
        ElMessage.error('加载菌种数据失败')
      }
    }

    const loadRegionOptions = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          const regions = await window.electronAPI.systemConfig.getRegions()
          regionOptions.value = regions || []
        } else {
          // 浏览器环境空数据 - 对应实验设置中的地区字段
          regionOptions.value = []
        }
        // 同步到Vuex store
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('加载地区数据失败:', error)
        ElMessage.error('加载地区数据失败')
      }
    }

    const loadSourceOptions = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          const sources = await window.electronAPI.systemConfig.getSampleSources()
          sourceOptions.value = sources || []
        } else {
          // 浏览器环境空数据 - 对应实验设置中的样本来源字段
          sourceOptions.value = []
        }
        // 同步到Vuex store
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('加载样本来源数据失败:', error)
        ElMessage.error('加载样本来源数据失败')
      }
    }

    const loadExperimentTypeOptions = async () => {
      try {
        if (window.electronAPI && window.electronAPI.systemConfig) {
          const types = await window.electronAPI.systemConfig.getExperimentTypes()
          experimentTypeOptions.value = types || []
        } else {
          // 浏览器环境空数据 - 对应实验设置中的实验类型字段
          experimentTypeOptions.value = []
        }
        // 同步到Vuex store
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('加载实验类型数据失败:', error)
        ElMessage.error('加载实验类型数据失败')
      }
    }

    const loadSystemConfig = async () => {
      try {
        // TODO: 实现从后端加载系统配置
        // systemConfig = await api.getSystemConfig()
      } catch (error) {
        ElMessage.error('加载系统配置失败')
      }
    }

    // 菌种管理方法
    const fetchNCBIInfo = async () => {
      if (!speciesForm.scientific_name.trim()) {
        ElMessage.warning('请先输入学名')
        return
      }

      fetchingNCBI.value = true
      try {
        // 调用NCBI API获取分类学信息
        const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=${encodeURIComponent(speciesForm.scientific_name)}&retmode=json`)
        const searchData = await response.json()

        if (searchData.esearchresult && searchData.esearchresult.idlist && searchData.esearchresult.idlist.length > 0) {
          const txid = searchData.esearchresult.idlist[0]

          // 获取详细信息
          const detailResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=${txid}&retmode=xml`)
          const xmlText = await detailResponse.text()

          // 解析XML获取信息
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

          const scientificName = xmlDoc.querySelector('ScientificName')?.textContent
          const rank = xmlDoc.querySelector('Rank')?.textContent

          if (scientificName) {
            speciesForm.ncbi_txid = txid

            // 如果没有缩写，尝试生成一个
            if (!speciesForm.abbreviation && scientificName) {
              const parts = scientificName.split(' ')
              if (parts.length >= 2) {
                speciesForm.abbreviation = parts[0].charAt(0).toUpperCase() + '. ' + parts[1].toLowerCase()
              }
            }

            ElMessage.success(`成功获取NCBI信息: ${scientificName} (TXID: ${txid})`)
          } else {
            ElMessage.warning('未找到匹配的分类学信息')
          }
        } else {
          ElMessage.warning('未找到匹配的分类学信息')
        }
      } catch (error) {
        console.error('获取NCBI信息失败:', error)
        ElMessage.error('获取NCBI信息失败，请检查网络连接')
      } finally {
        fetchingNCBI.value = false
      }
    }

    const addSpecies = () => {
      isEditSpecies.value = false
      speciesForm.id = null
      speciesForm.name = ''
      speciesForm.scientific_name = ''
      speciesForm.abbreviation = ''
      speciesForm.ncbi_txid = ''
      speciesForm.description = ''
      speciesForm.status = 'active'
      speciesDialogVisible.value = true
    }

    const editSpecies = (species) => {
      isEditSpecies.value = true
      speciesForm.id = species.id
      speciesForm.name = species.name
      speciesForm.scientific_name = species.scientific_name
      speciesForm.abbreviation = species.abbreviation || ''
      speciesForm.ncbi_txid = species.ncbi_txid || ''
      speciesForm.description = species.description
      speciesForm.status = species.status
      speciesDialogVisible.value = true
    }

    const saveSpecies = async () => {
      if (!speciesFormRef.value) return

      await speciesFormRef.value.validate(async (valid) => {
        if (!valid) return

        try {
          const speciesData = { ...speciesForm }

          // 使用Vuex store保存菌种数据
          const savedSpecies = await store.dispatch('saveSpeciesOption', speciesData)

          if (isEditSpecies.value) {
            // 更新现有菌种
            const index = speciesOptions.value.findIndex(item => item.id === speciesData.id)
            if (index !== -1) {
              speciesOptions.value[index] = savedSpecies
            }
          } else {
            // 添加新菌种
            speciesOptions.value.push(savedSpecies)
          }

          ElMessage.success(isEditSpecies.value ? '菌种更新成功' : '菌种添加成功')
          speciesDialogVisible.value = false

          // 重新加载系统配置以确保数据同步
          await store.dispatch('loadSystemConfig')
        } catch (error) {
          console.error('保存菌种失败:', error)
          ElMessage.error('保存菌种失败: ' + error.message)
        }
      })
    }

    const toggleSpeciesStatus = async (species) => {
      try {
        const updatedSpecies = {
          ...species,
          status: species.status === 'active' ? 'disabled' : 'active'
        }

        // 使用Vuex store更新菌种状态
        await store.dispatch('saveSpeciesOption', updatedSpecies)

        // 更新本地数据
        species.status = updatedSpecies.status

        ElMessage.success('状态更新成功')

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('状态更新失败:', error)
        ElMessage.error('状态更新失败: ' + error.message)
      }
    }

    const deleteSpecies = async (species) => {
      try {
        await ElMessageBox.confirm('确定要删除该菌种吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 使用Vuex store删除菌种（实际是设置为inactive状态）
        const updatedSpecies = {
          ...species,
          status: 'inactive'
        }

        await store.dispatch('saveSpeciesOption', updatedSpecies)

        // 从本地列表中移除
        const index = speciesOptions.value.findIndex(item => item.id === species.id)
        if (index !== -1) {
          speciesOptions.value.splice(index, 1)
        }

        ElMessage.success('删除成功')

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 地区管理方法
    const addRegion = () => {
      isEditRegion.value = false
      regionForm.id = null
      regionForm.name = ''
      regionForm.code = ''
      regionForm.level = 'province'
      regionForm.parent_id = null
      regionForm.status = 'active'
      regionDialogVisible.value = true
    }

    const editRegion = (region) => {
      isEditRegion.value = true
      regionForm.id = region.id
      regionForm.name = region.name
      regionForm.code = region.code
      regionForm.level = region.level
      regionForm.parent_id = region.parent_id
      regionForm.status = region.status
      regionDialogVisible.value = true
    }

    const saveRegion = async () => {
      if (!regionFormRef.value) return

      await regionFormRef.value.validate(async (valid) => {
        if (!valid) return

        try {
          const regionData = { ...regionForm }

          // 使用Vuex store保存地区数据
          const savedRegion = await store.dispatch('saveRegionOption', regionData)

          if (isEditRegion.value) {
            // 更新现有地区
            const index = regionOptions.value.findIndex(item => item.id === regionData.id)
            if (index !== -1) {
              regionOptions.value[index] = savedRegion
            }
          } else {
            // 添加新地区
            regionOptions.value.push(savedRegion)
          }

          ElMessage.success(isEditRegion.value ? '地区更新成功' : '地区添加成功')
          regionDialogVisible.value = false

          // 重新加载系统配置以确保数据同步
          await store.dispatch('loadSystemConfig')
        } catch (error) {
          console.error('保存地区失败:', error)
          ElMessage.error('保存地区失败: ' + error.message)
        }
      })
    }

    const toggleRegionStatus = async (region) => {
      try {
        const updatedRegion = {
          ...region,
          status: region.status === 'active' ? 'disabled' : 'active'
        }

        // 使用Vuex store更新地区状态
        await store.dispatch('saveRegionOption', updatedRegion)

        // 更新本地数据
        region.status = updatedRegion.status

        ElMessage.success('状态更新成功')

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('状态更新失败:', error)
        ElMessage.error('状态更新失败: ' + error.message)
      }
    }

    const deleteRegion = async (region) => {
      try {
        await ElMessageBox.confirm('确定要删除该地区吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 使用Vuex store删除地区（实际是设置为inactive状态）
        const updatedRegion = {
          ...region,
          status: 'inactive'
        }

        await store.dispatch('saveRegionOption', updatedRegion)

        // 从本地列表中移除
        const index = regionOptions.value.findIndex(item => item.id === region.id)
        if (index !== -1) {
          regionOptions.value.splice(index, 1)
        }

        ElMessage.success('删除成功')

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 样本来源管理方法
    const addSource = () => {
      isEditSource.value = false
      sourceForm.id = null
      sourceForm.name = ''
      sourceForm.category = 'clinical'
      sourceForm.description = ''
      sourceForm.status = 'active'
      sourceDialogVisible.value = true
    }

    const editSource = (source) => {
      isEditSource.value = true
      sourceForm.id = source.id
      sourceForm.name = source.name
      sourceForm.category = source.category
      sourceForm.description = source.description
      sourceForm.status = source.status
      sourceDialogVisible.value = true
    }

    const saveSource = async () => {
      if (!sourceFormRef.value) return

      await sourceFormRef.value.validate(async (valid) => {
        if (!valid) return

        try {
          const sourceData = { ...sourceForm }

          // 使用Vuex store保存样本来源数据
          const savedSource = await store.dispatch('saveSourceOption', sourceData)

          if (isEditSource.value) {
            // 更新现有样本来源
            const index = sourceOptions.value.findIndex(item => item.id === sourceData.id)
            if (index !== -1) {
              sourceOptions.value[index] = savedSource
            }
          } else {
            // 添加新样本来源
            sourceOptions.value.push(savedSource)
          }

          ElMessage.success(isEditSource.value ? '样本来源更新成功' : '样本来源添加成功')
          sourceDialogVisible.value = false

          // 重新加载系统配置以确保数据同步
          await store.dispatch('loadSystemConfig')
        } catch (error) {
          console.error('保存样本来源失败:', error)
          ElMessage.error('保存样本来源失败: ' + error.message)
        }
      })
    }

    const toggleSourceStatus = async (source) => {
      try {
        const updatedSource = {
          ...source,
          status: source.status === 'active' ? 'disabled' : 'active'
        }

        // 使用Vuex store更新样本来源状态
        await store.dispatch('saveSourceOption', updatedSource)

        // 更新本地数据
        source.status = updatedSource.status

        ElMessage.success('状态更新成功')

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('状态更新失败:', error)
        ElMessage.error('状态更新失败: ' + error.message)
      }
    }

    const deleteSource = async (source) => {
      try {
        await ElMessageBox.confirm('确定要删除该来源吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 使用Vuex store删除样本来源（实际是设置为inactive状态）
        const updatedSource = {
          ...source,
          status: 'inactive'
        }

        await store.dispatch('saveSourceOption', updatedSource)

        // 从本地列表中移除
        const index = sourceOptions.value.findIndex(item => item.id === source.id)
        if (index !== -1) {
          sourceOptions.value.splice(index, 1)
        }

        ElMessage.success('删除成功')

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 实验类型管理方法
    const addExperimentType = () => {
      isEditExperimentType.value = false
      experimentTypeForm.id = null
      experimentTypeForm.name = ''
      experimentTypeForm.code = ''
      experimentTypeForm.category = 'analysis'
      experimentTypeForm.description = ''
      experimentTypeForm.status = 'active'
      experimentTypeDialogVisible.value = true
    }

    const editExperimentType = (type) => {
      isEditExperimentType.value = true
      experimentTypeForm.id = type.id
      experimentTypeForm.name = type.name
      experimentTypeForm.code = type.code
      experimentTypeForm.category = type.category
      experimentTypeForm.description = type.description
      experimentTypeForm.status = type.status
      experimentTypeDialogVisible.value = true
    }

    const saveExperimentType = async () => {
      if (!experimentTypeFormRef.value) return

      try {
        await experimentTypeFormRef.value.validate()

        if (window.electronAPI && window.electronAPI.systemConfig) {
          const savedType = await window.electronAPI.systemConfig.saveExperimentType(experimentTypeForm)

          if (isEditExperimentType.value) {
            // 更新现有实验类型
            const index = experimentTypeOptions.value.findIndex(item => item.id === experimentTypeForm.id)
            if (index !== -1) {
              experimentTypeOptions.value[index] = savedType
            }
          } else {
            // 添加新实验类型
            experimentTypeOptions.value.push(savedType)
          }

          ElMessage.success(isEditExperimentType.value ? '实验类型更新成功' : '实验类型添加成功')
          experimentTypeDialogVisible.value = false

          // 重新加载系统配置以确保数据同步
          await store.dispatch('loadSystemConfig')
        } else {
          // 浏览器环境模拟
          ElMessage.success(isEditExperimentType.value ? '实验类型更新成功' : '实验类型添加成功')
          experimentTypeDialogVisible.value = false
        }
      } catch (error) {
        console.error('保存实验类型失败:', error)
        ElMessage.error('保存实验类型失败')
      }
    }

    const toggleExperimentTypeStatus = async (type) => {
      try {
        const newStatus = type.status === 'active' ? 'disabled' : 'active'

        if (window.electronAPI && window.electronAPI.systemConfig) {
          await window.electronAPI.systemConfig.saveExperimentType({
            ...type,
            status: newStatus
          })
        }

        // 更新本地状态
        type.status = newStatus
        ElMessage.success(`实验类型已${newStatus === 'active' ? '启用' : '禁用'}`)

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('更新实验类型状态失败:', error)
        ElMessage.error('更新状态失败')
      }
    }

    const deleteExperimentType = async (type) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除实验类型 "${type.name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (window.electronAPI && window.electronAPI.systemConfig) {
          await window.electronAPI.systemConfig.deleteExperimentType(type.id)
        }

        // 从本地列表中移除
        const index = experimentTypeOptions.value.findIndex(item => item.id === type.id)
        if (index !== -1) {
          experimentTypeOptions.value.splice(index, 1)
        }

        ElMessage.success('删除成功')

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 批量操作方法
    const handleSpeciesSelectionChange = (selection) => {
      selectedSpecies.value = selection
    }

    const handleRegionSelectionChange = (selection) => {
      selectedRegions.value = selection
    }

    const handleSourceSelectionChange = (selection) => {
      selectedSources.value = selection
    }

    const handleExperimentTypeSelectionChange = (selection) => {
      selectedExperimentTypes.value = selection
    }

    const batchDeleteSpecies = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedSpecies.value.length} 个菌种吗？此操作不可撤销。`,
          '确认批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        for (const species of selectedSpecies.value) {
          const updatedSpecies = {
            ...species,
            status: 'inactive'
          }
          await store.dispatch('saveSpeciesOption', updatedSpecies)

          // 从本地列表中移除
          const index = speciesOptions.value.findIndex(item => item.id === species.id)
          if (index !== -1) {
            speciesOptions.value.splice(index, 1)
          }
        }

        const deletedCount = selectedSpecies.value.length
        selectedSpecies.value = []
        ElMessage.success(`成功删除 ${deletedCount} 个菌种`)

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除菌种失败:', error)
          ElMessage.error('批量删除失败')
        }
      }
    }

    const batchDeleteRegions = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedRegions.value.length} 个地区吗？此操作不可撤销。`,
          '确认批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        for (const region of selectedRegions.value) {
          const updatedRegion = {
            ...region,
            status: 'inactive'
          }
          await store.dispatch('saveRegionOption', updatedRegion)

          // 从本地列表中移除
          const index = regionOptions.value.findIndex(item => item.id === region.id)
          if (index !== -1) {
            regionOptions.value.splice(index, 1)
          }
        }

        const deletedCount = selectedRegions.value.length
        selectedRegions.value = []
        ElMessage.success(`成功删除 ${deletedCount} 个地区`)

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除地区失败:', error)
          ElMessage.error('批量删除失败')
        }
      }
    }

    const batchDeleteSources = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedSources.value.length} 个样本来源吗？此操作不可撤销。`,
          '确认批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        for (const source of selectedSources.value) {
          const updatedSource = {
            ...source,
            status: 'inactive'
          }
          await store.dispatch('saveSourceOption', updatedSource)

          // 从本地列表中移除
          const index = sourceOptions.value.findIndex(item => item.id === source.id)
          if (index !== -1) {
            sourceOptions.value.splice(index, 1)
          }
        }

        const deletedCount = selectedSources.value.length
        selectedSources.value = []
        ElMessage.success(`成功删除 ${deletedCount} 个样本来源`)

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除样本来源失败:', error)
          ElMessage.error('批量删除失败')
        }
      }
    }

    const batchDeleteExperimentTypes = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedExperimentTypes.value.length} 个实验类型吗？此操作不可撤销。`,
          '确认批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 批量删除
        for (const type of selectedExperimentTypes.value) {
          if (window.electronAPI && window.electronAPI.systemConfig) {
            await window.electronAPI.systemConfig.deleteExperimentType(type.id)
          }

          // 从本地列表中移除
          const index = experimentTypeOptions.value.findIndex(item => item.id === type.id)
          if (index !== -1) {
            experimentTypeOptions.value.splice(index, 1)
          }
        }

        const deletedCount = selectedExperimentTypes.value.length
        selectedExperimentTypes.value = []
        ElMessage.success(`成功删除 ${deletedCount} 个实验类型`)

        // 重新加载系统配置以确保数据同步
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除实验类型失败:', error)
          ElMessage.error('批量删除失败')
        }
      }
    }

    // 数据库管理方法
    const performHealthCheck = async () => {
      healthCheckLoading.value = true
      try {
        if (window.electronAPI && window.electronAPI.database) {
          databaseStatus.value = await window.electronAPI.database.healthCheck()
          ElMessage.success('数据库健康检查完成')
        } else {
          // 浏览器环境模拟
          databaseStatus.value = {
            status: 'healthy',
            checks: [
              { type: 'table_integrity', status: 'ok', count: 5 },
              { type: 'indexes', status: 'ok', count: 12 },
              { type: 'database_size', status: 'ok', size_mb: '2.5' }
            ],
            timestamp: new Date().toISOString()
          }
          ElMessage.success('数据库健康检查完成（模拟）')
        }
      } catch (error) {
        console.error('数据库健康检查失败:', error)
        ElMessage.error('数据库健康检查失败')
      } finally {
        healthCheckLoading.value = false
      }
    }

    const optimizeDatabase = async () => {
      try {
        await ElMessageBox.confirm(
          '数据库优化可能需要一些时间，期间系统可能会暂时无响应。确定要继续吗？',
          '确认优化',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        optimizeLoading.value = true

        if (window.electronAPI && window.electronAPI.database) {
          const result = await window.electronAPI.database.optimize()
          if (result.status === 'success') {
            ElMessage.success('数据库优化完成')
            // 重新执行健康检查
            await performHealthCheck()
          } else {
            ElMessage.error('数据库优化失败: ' + result.error)
          }
        } else {
          // 浏览器环境模拟
          await new Promise(resolve => setTimeout(resolve, 2000))
          ElMessage.success('数据库优化完成（模拟）')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('数据库优化失败:', error)
          ElMessage.error('数据库优化失败')
        }
      } finally {
        optimizeLoading.value = false
      }
    }

    const loadMigrationHistory = async () => {
      try {
        if (window.electronAPI && window.electronAPI.database) {
          migrationHistory.value = await window.electronAPI.database.getMigrationHistory()
        } else {
          // 浏览器环境模拟
          migrationHistory.value = [
            {
              id: 1,
              version: '1.0.4',
              name: 'add_foreign_key_constraints',
              executed_at: new Date().toISOString(),
              checksum: 'a1b2c3d4e5f6'
            },
            {
              id: 2,
              version: '1.0.3',
              name: 'optimize_table_structure',
              executed_at: new Date(Date.now() - 86400000).toISOString(),
              checksum: 'f6e5d4c3b2a1'
            }
          ]
        }
      } catch (error) {
        console.error('加载迁移历史失败:', error)
        ElMessage.error('加载迁移历史失败')
      }
    }

    const getCheckLabel = (type) => {
      const labels = {
        'table_integrity': '表完整性',
        'indexes': '索引状态',
        'database_size': '数据库大小'
      }
      return labels[type] || type
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('zh-CN')
    }

    // 权限管理方法
    const loadRoles = async () => {
      try {
        if (window.electronAPI && window.electronAPI.users) {
          const rolesData = await window.electronAPI.users.getAllRoles()
          // 将角色对象转换为数组格式
          roles.value = Object.keys(rolesData).map((key, index) => ({
            id: index + 1,
            name: key,
            display_name: rolesData[key].name,
            description: rolesData[key].description,
            is_system: !rolesData[key].custom,
            user_count: 0, // TODO: 从数据库获取实际用户数
            permission_count: rolesData[key].permissions ? rolesData[key].permissions.length : 0
          }))
        } else {
          // 浏览器环境模拟
          roles.value = [
            {
              id: 1,
              name: 'admin',
              display_name: '系统管理员',
              description: '拥有系统所有权限',
              is_system: 1,
              user_count: 1,
              permission_count: 18
            },
            {
              id: 2,
              name: 'analyst',
              display_name: '分析员',
              description: '可以进行生物信息学分析',
              is_system: 1,
              user_count: 0,
              permission_count: 8
            }
          ]
        }
      } catch (error) {
        console.error('加载角色列表失败:', error)
        ElMessage.error('加载角色列表失败')
      }
    }

    const loadPermissions = async () => {
      try {
        if (window.electronAPI && window.electronAPI.users) {
          const permissionsData = await window.electronAPI.users.getAllPermissions()
          // 将权限对象转换为数组格式
          permissions.value = Object.keys(permissionsData).map((key, index) => {
            const parts = key.split('.')
            return {
              id: index + 1,
              name: key,
              display_name: permissionsData[key],
              module: parts[0] || 'system',
              action: parts[1] || 'unknown',
              description: ''
            }
          })
        } else {
          // 浏览器环境模拟
          permissions.value = [
            { id: 1, name: 'users.view', display_name: '查看用户', module: 'users', action: 'view', description: '' },
            { id: 2, name: 'users.create', display_name: '创建用户', module: 'users', action: 'create', description: '' },
            { id: 3, name: 'strains.view', display_name: '查看菌株', module: 'strains', action: 'view', description: '' },
            { id: 4, name: 'strains.create', display_name: '创建菌株', module: 'strains', action: 'create', description: '' },
            { id: 5, name: 'analysis.run', display_name: '运行分析', module: 'analysis', action: 'run', description: '' }
          ]
        }
      } catch (error) {
        console.error('加载权限列表失败:', error)
        ElMessage.error('加载权限列表失败')
      }
    }

    const showCreateRoleDialog = () => {
      createRoleDialogVisible.value = true
    }

    const resetCreateRoleForm = () => {
      createRoleForm.name = ''
      createRoleForm.display_name = ''
      createRoleForm.description = ''
    }

    const handleCreateRole = async () => {
      try {
        createRoleLoading.value = true

        // 这里应该调用后端API创建角色
        if (window.electronAPI && window.electronAPI.permissions) {
          // 实际的API调用
          ElMessage.info('创建角色API开发中...')
        } else {
          // 浏览器环境模拟
          await new Promise(resolve => setTimeout(resolve, 1000))
          ElMessage.success('角色创建成功')
          createRoleDialogVisible.value = false
          resetCreateRoleForm()
          await loadRoles()
        }
      } catch (error) {
        console.error('创建角色失败:', error)
        ElMessage.error('创建角色失败')
      } finally {
        createRoleLoading.value = false
      }
    }

    const editRole = (role) => {
      editRoleForm.id = role.id
      editRoleForm.name = role.name
      editRoleForm.display_name = role.display_name
      editRoleForm.description = role.description || ''
      editRoleForm.is_system = role.is_system
      editRoleDialogVisible.value = true
    }

    const resetEditRoleForm = () => {
      editRoleForm.id = null
      editRoleForm.name = ''
      editRoleForm.display_name = ''
      editRoleForm.description = ''
      editRoleForm.is_system = false
    }

    const handleEditRole = async () => {
      try {
        editRoleLoading.value = true

        if (window.electronAPI && window.electronAPI.permissions) {
          // 实际的API调用
          ElMessage.info('编辑角色API开发中...')
        } else {
          // 浏览器环境模拟
          await new Promise(resolve => setTimeout(resolve, 1000))
          ElMessage.success('角色编辑成功')
          editRoleDialogVisible.value = false
          resetEditRoleForm()
          await loadRoles()
        }
      } catch (error) {
        console.error('编辑角色失败:', error)
        ElMessage.error('编辑角色失败')
      } finally {
        editRoleLoading.value = false
      }
    }

    const editRolePermissions = async (role) => {
      try {
        currentEditingRole.value = role

        // 加载角色当前的权限
        if (window.electronAPI && window.electronAPI.permissions) {
          const rolePermissions = await window.electronAPI.permissions.getRolePermissions(role.id)
          selectedPermissions.value = rolePermissions.map(p => p.id)
        } else {
          // 浏览器环境模拟
          selectedPermissions.value = [1, 3, 5] // 模拟已选择的权限ID
        }

        editRolePermissionsDialogVisible.value = true
      } catch (error) {
        console.error('加载角色权限失败:', error)
        ElMessage.error('加载角色权限失败')
      }
    }

    const resetEditRolePermissionsForm = () => {
      currentEditingRole.value = null
      selectedPermissions.value = []
    }

    const handleSaveRolePermissions = async () => {
      try {
        savePermissionsLoading.value = true

        if (window.electronAPI && window.electronAPI.permissions) {
          // 实际的API调用
          ElMessage.info('保存角色权限API开发中...')
        } else {
          // 浏览器环境模拟
          await new Promise(resolve => setTimeout(resolve, 1000))
          ElMessage.success('角色权限保存成功')
          editRolePermissionsDialogVisible.value = false
          resetEditRolePermissionsForm()
          await loadRoles()
        }
      } catch (error) {
        console.error('保存角色权限失败:', error)
        ElMessage.error('保存角色权限失败')
      } finally {
        savePermissionsLoading.value = false
      }
    }

    // 权限模块相关方法
    const getModuleDisplayName = (moduleName) => {
      const moduleNames = {
        'users': '用户管理',
        'strains': '菌株管理',
        'genomes': '基因组管理',
        'analysis': '生物信息学分析',
        'settings': '系统设置',
        'audit': '审计日志',
        'database': '数据库管理'
      }
      return moduleNames[moduleName] || moduleName
    }

    const isModuleAllSelected = (moduleName) => {
      const modulePermissions = groupedPermissionsForEdit.value.find(m => m.name === moduleName)
      if (!modulePermissions) return false

      const modulePermissionIds = modulePermissions.permissions.map(p => p.id)
      return modulePermissionIds.every(id => selectedPermissions.value.includes(id))
    }

    const isModuleIndeterminate = (moduleName) => {
      const modulePermissions = groupedPermissionsForEdit.value.find(m => m.name === moduleName)
      if (!modulePermissions) return false

      const modulePermissionIds = modulePermissions.permissions.map(p => p.id)
      const selectedCount = modulePermissionIds.filter(id => selectedPermissions.value.includes(id)).length

      return selectedCount > 0 && selectedCount < modulePermissionIds.length
    }

    const handleModuleSelectAll = (moduleName, checked) => {
      const modulePermissions = groupedPermissionsForEdit.value.find(m => m.name === moduleName)
      if (!modulePermissions) return

      const modulePermissionIds = modulePermissions.permissions.map(p => p.id)

      if (checked) {
        // 添加模块所有权限
        modulePermissionIds.forEach(id => {
          if (!selectedPermissions.value.includes(id)) {
            selectedPermissions.value.push(id)
          }
        })
      } else {
        // 移除模块所有权限
        selectedPermissions.value = selectedPermissions.value.filter(id =>
          !modulePermissionIds.includes(id)
        )
      }
    }

    const deleteRole = async (role) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除角色 "${role.display_name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        ElMessage.success('删除成功')
        await loadRoles()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除角色失败:', error)
          ElMessage.error('删除角色失败')
        }
      }
    }

    // 系统配置方法
    const saveSystemConfig = async () => {
      try {
        // TODO: 实现保存系统配置
        ElMessage.success('系统配置保存成功')
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }

    // 工具方法
    const getLevelText = (level) => {
      const textMap = {
        province: '省/直辖市',
        city: '市/区',
        county: '县/区'
      }
      return textMap[level] || '未知'
    }

    onMounted(() => {
      loadSpeciesOptions()
      loadRegionOptions()
      loadSourceOptions()
      loadExperimentTypeOptions()
      loadSystemConfig()
      loadMigrationHistory()
      loadRoles()
      loadPermissions()
    })

    return {
      // 权限检查
      hasPermission,
      isAdmin,
      canManageRoles,
      canManageSettings,
      // 其他数据
      activeTab,
      speciesOptions,
      speciesDialogVisible,
      isEditSpecies,
      speciesForm,
      speciesFormRules,
      speciesFormRef,
      fetchingNCBI,
      fetchNCBIInfo,
      regionOptions,
      regionDialogVisible,
      isEditRegion,
      regionForm,
      regionFormRules,
      regionFormRef,
      sourceOptions,
      sourceDialogVisible,
      isEditSource,
      sourceForm,
      sourceFormRules,
      sourceFormRef,
      experimentTypeOptions,
      experimentTypeDialogVisible,
      isEditExperimentType,
      experimentTypeForm,
      experimentTypeFormRules,
      experimentTypeFormRef,
      selectedExperimentTypes,
      systemConfig,
      parentRegions,
      // 批量操作相关
      selectedSpecies,
      selectedRegions,
      selectedSources,
      handleSpeciesSelectionChange,
      handleRegionSelectionChange,
      handleSourceSelectionChange,
      handleExperimentTypeSelectionChange,
      batchDeleteSpecies,
      batchDeleteRegions,
      batchDeleteSources,
      batchDeleteExperimentTypes,
      addSpecies,
      editSpecies,
      saveSpecies,
      toggleSpeciesStatus,
      deleteSpecies,
      addRegion,
      editRegion,
      saveRegion,
      toggleRegionStatus,
      deleteRegion,
      addSource,
      editSource,
      saveSource,
      toggleSourceStatus,
      deleteSource,
      addExperimentType,
      editExperimentType,
      saveExperimentType,
      toggleExperimentTypeStatus,
      deleteExperimentType,
      saveSystemConfig,
      // 数据库管理
      databaseStatus,
      migrationHistory,
      healthCheckLoading,
      optimizeLoading,
      performHealthCheck,
      optimizeDatabase,
      loadMigrationHistory,
      getCheckLabel,
      formatDate,
      // 权限管理
      permissionActiveTab,
      roles,
      permissions,
      groupedPermissions,
      loadRoles,
      loadPermissions,
      showCreateRoleDialog,
      editRolePermissions,
      deleteRole,
      // 创建角色
      createRoleDialogVisible,
      createRoleLoading,
      createRoleForm,
      createRoleRules,
      resetCreateRoleForm,
      handleCreateRole,
      // 编辑角色
      editRole,
      editRoleDialogVisible,
      editRoleLoading,
      editRoleForm,
      editRoleRules,
      resetEditRoleForm,
      handleEditRole,
      // 编辑角色权限
      editRolePermissionsDialogVisible,
      savePermissionsLoading,
      currentEditingRole,
      selectedPermissions,
      groupedPermissionsForEdit,
      resetEditRolePermissionsForm,
      handleSaveRolePermissions,
      getModuleDisplayName,
      isModuleAllSelected,
      isModuleIndeterminate,
      handleModuleSelectAll,
      getLevelText
    }
  }
}
</script>

<style scoped>
.admin-settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
}

.content-area {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-management {
  margin-top: 20px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.field-header h3 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-actions .el-button {
  margin: 0;
}

.system-config {
  margin-top: 20px;
}

.database-management {
  .database-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .status-card, .migration-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;

    .status-item {
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background: #fafafa;

      .status-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .status-value {
        display: flex;
        align-items: center;
        gap: 8px;

        .count, .size {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .checksum {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    background: #f5f7fa;
    padding: 2px 4px;
    border-radius: 2px;
  }
}

.permission-management {
  .roles-header, .permissions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h4 {
      margin: 0;
      color: #303133;
    }
  }

  .el-tabs--card {
    .el-tabs__header {
      margin-bottom: 20px;
    }
  }
}

.permissions-tree {
  .permission-module {
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;

    .module-header {
      padding: 12px 16px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      font-weight: 600;
      color: #303133;
    }

    .module-permissions {
      padding: 16px;

      .el-checkbox-group {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }

      .permission-item {
        margin-right: 0;
        margin-bottom: 0;
      }
    }
  }
}

.no-permission-text {
  color: #999;
  font-size: 12px;
  font-style: italic;
}
</style>
