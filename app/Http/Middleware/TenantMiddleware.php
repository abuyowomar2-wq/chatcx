<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->isAdmin() && !$user->tenant_id) {
            return redirect()->route('merchant.settings')
                ->with('error', 'يرجى إعداد حساب التاجر أولاً');
        }

        if ($user && $user->tenant_id) {
            $tenant = $user->tenant;
            if (!$tenant || !$tenant->is_active) {
                auth()->logout();
                return redirect()->route('login')
                    ->with('error', 'حسابك غير نشط');
            }

            $request->merge(['tenant' => $tenant]);
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
        }

        return $next($request);
    }
}
