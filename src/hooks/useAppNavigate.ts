import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { useMemo } from 'react';
import { APP_ROUTES } from '../route';

const useAppNavigate = () => {
  const navigate = useNavigate();

  const typeSafeNavigate = useMemo(
    () => ({
      to: (path: string, options?: NavigateOptions) => navigate(path, options),
      goBack: () => navigate(-1),

      toRoot: (options?: NavigateOptions) => navigate(APP_ROUTES.ROOT, options),
      toLogin: (options?: NavigateOptions) =>
        navigate(APP_ROUTES.LOGIN, options),
      toOnboarding: (options?: NavigateOptions) =>
        navigate(APP_ROUTES.ONBOARDING, options),
      toDashboard: (options?: NavigateOptions) =>
        navigate(APP_ROUTES.APP.DASHBOARD, options),
      toBoard: (options?: NavigateOptions) =>
        navigate(APP_ROUTES.APP.BOARD, options),
      toMembers: (options?: NavigateOptions) =>
        navigate(APP_ROUTES.APP.MEMBERS, options),
      toAcceptInvite: (token: string, options?: NavigateOptions) =>
        navigate(`${APP_ROUTES.ACCEPT_INVITE}?token=${token}`, options),
      toAuthCallback: (token: string, options?: NavigateOptions) =>
        navigate(`${APP_ROUTES.AUTH_CALLBACK}?token=${token}`, options),
    }),
    [navigate]
  );

  return typeSafeNavigate;
};

export default useAppNavigate;
