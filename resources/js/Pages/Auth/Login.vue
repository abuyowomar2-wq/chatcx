<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-primary-600">ChatCX</h1>
                <p class="text-gray-500 mt-2">تسجيل الدخول إلى لوحة التحكم</p>
            </div>

            <div v-if="$page.props.errors?.email" class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                {{ $page.props.errors.email }}
            </div>

            <form @submit.prevent="login">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <input type="email" v-model="form.email" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>

                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-medium mb-2">كلمة المرور</label>
                    <input type="password" v-model="form.password" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
                    {{ loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}
                </button>
            </form>

            <p class="text-center mt-4 text-sm text-gray-500">
                ليس لديك حساب؟
                <Link href="/register" class="text-primary-600 hover:text-primary-700">إنشاء حساب جديد</Link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Link, router } from '@inertiajs/vue3'

const loading = ref(false)
const form = reactive({ email: '', password: '' })

function login() {
    loading.value = true
    router.post('/login', form, {
        onFinish: () => { loading.value = false }
    })
}
</script>
