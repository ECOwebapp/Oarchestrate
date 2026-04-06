<script setup vapor>
import { useMemberStore } from '@/stores/member'
import { usePosStore } from '@/stores/positions'
import { useSubtaskStore } from '@/stores/subtasks'
import { useAuthStore } from '@/stores/useAuthStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

const emit = defineEmits(['close', 'success'])
const props = defineProps({
  parentId: { type: Number }
})

const memberStore = useMemberStore()
const posStore = usePosStore()
const subtaskStore = useSubtaskStore()
const auth = useAuthStore()

const { members } = storeToRefs(memberStore)

const loading = ref(false)
const errorMsg = ref('')

const newSubtask = ref({
  parentId: props.parentId,
  assignee: null,
  outputLink: '',
  type: 1,
  design: false
})

onMounted(async () => {
  try {
    await memberStore.fetchMembers()
  } catch (err) {
    errorMsg.value = 'Failed to load members: ' + err.message
  }
})

const assigneeOptions = computed(() => {
  if (!members.value) return []
  return members.value.map(m => ({
    id: m.user_id,
    name: `${m.fname || ''} ${m.lname || ''}`.trim()
  })).filter(m => m.name)
})

const canSubmit = computed(() => {
  return newSubtask.value.parentId && newSubtask.value.assignee
})

const handleSubmit = async () => {
  if (!canSubmit.value) {
    errorMsg.value = 'Please fill in all required fields'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    await subtaskStore.addSubTasks({
      subTask: {
        parentId: newSubtask.value.parentId,
        assignee: newSubtask.value.assignee,
        outputLink: newSubtask.value.outputLink,
        type: newSubtask.value.type,
        design: newSubtask.value.design
      }
    })
    emit('success')
    newSubtask.value = {
      parentId: props.parentId,
      assignee: null,
      outputLink: '',
      type: 1,
      design: false
    }
  } catch (err) {
    errorMsg.value = 'Failed to create subtask: ' + err.message
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="add-subtask-form">
    <div class="form-header">
      <h2>Add Subtask</h2>
      <button @click="handleClose" class="close-btn">✕</button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="assignee">Assign To *</label>
        <select 
          id="assignee"
          v-model="newSubtask.assignee"
          required
        >
          <option value="">Select a member</option>
          <option 
            v-for="option in assigneeOptions"
            :key="option.id"
            :value="option.id"
          >
            {{ option.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="outputLink">Output Link</label>
        <input 
          id="outputLink"
          v-model="newSubtask.outputLink"
          type="url"
          placeholder="https://..."
        />
      </div>

      <div class="form-group">
        <label for="type">Type</label>
        <select v-model="newSubtask.type">
          <option value="1">Regular</option>
          <option value="2">Insertion</option>
        </select>
      </div>

      <div class="form-group checkbox">
        <input 
          id="design"
          v-model="newSubtask.design"
          type="checkbox"
        />
        <label for="design">Mark as Design</label>
      </div>

      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

      <div class="form-actions">
        <button type="button" @click="handleClose" class="btn-secondary">Cancel</button>
        <button type="submit" :disabled="!canSubmit || loading" class="btn-primary">
          {{ loading ? 'Creating...' : 'Create Subtask' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-subtask-form {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-group.checkbox input {
  width: auto;
  margin-right: 8px;
}

.form-group.checkbox label {
  margin-bottom: 0;
  margin-left: 0;
}

.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
