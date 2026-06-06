<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-primary-600">ChatCX</h1>
                <p class="text-gray-500 mt-2">إنشاء حساب جديد لخدمة العملاء</p>
            </div>

            <form @submit.prevent="register">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">اسم المتجر</label>
                    <input type="text" v-model="form.store_name" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">الاسم</label>
                    <input type="text" v-model="form.name" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <input type="email" v-model="form.email" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">رقم الجوال</label>
                    <input type="tel" v-model="form.phone"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">كلمة المرور</label>
                    <input type="password" v-model="form.password" required minlength="8"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-medium mb-2">تأكيد كلمة المرور</label>
                    <input type="password" v-model="form.password_confirmation" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                    {{ loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب' }}
                </button>
            </form>

            <p class="text-center mt-4 text-sm text-gray-500">
                لديك حساب بالفعل؟
                <Link href="/login" class="text-primary-600 hover:text-primary-700">تسجيل دخول</Link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Link, router } from '@inertiajs/vue3'

const loading = ref(false)
const form = reactive({
    store_name: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
})

function register() {
    loading.value = true
    router.post('/register', form, {
        onFinish: () => { loading.value = false }
    })
}
</script>
