<template>
    <AdminLayout>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">التجار</h1>
        </div>

        <div class="bg-white rounded-lg shadow-sm">
            <table class="w-full">
                <thead>
                    <tr class="border-b text-sm text-gray-500">
                        <th class="text-right p-3">المتجر</th>
                        <th class="text-right p-3">البريد</th>
                        <th class="text-right p-3">الخطة</th>
                        <th class="text-center p-3">المحادثات</th>
                        <th class="text-center p-3">الجهات</th>
                        <th class="text-center p-3">الوكلاء</th>
                        <th class="text-center p-3">التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="t in tenants.data" :key="t.id" class="border-b text-sm hover:bg-gray-50">
                        <td class="p-3 font-medium">{{ t.store_name }}</td>
                        <td class="p-3 text-gray-600">{{ t.email }}</td>
                        <td class="p-3">{{ t.plan }}</td>
                        <td class="p-3 text-center">{{ t.conversations_count }}</td>
                        <td class="p-3 text-center">{{ t.contacts_count }}</td>
                        <td class="p-3 text-center">{{ t.agents_count }}</td>
                        <td class="p-3 text-center text-gray-500">{{ t.created_at }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue'
defineProps({ tenants: Object })
</script>
