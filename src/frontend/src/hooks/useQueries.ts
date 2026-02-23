import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Post, Course, Enrollment } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useAddPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPost(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserPosts(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userPosts', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getUserPosts(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// Course-related hooks

export function useGetAllCourses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['allCourses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetCourseById(id: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Course | null>({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getCourseById(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useGetCoursesByCreator(creator: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['coursesByCreator', creator?.toString()],
    queryFn: async () => {
      if (!actor || !creator) return [];
      return actor.getCoursesByCreator(creator);
    },
    enabled: !!actor && !actorFetching && !!creator,
  });
}

export function useCreateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title: string;
      description: string;
      price: bigint;
      thumbnailUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCourse(
        params.id,
        params.title,
        params.description,
        params.price,
        params.thumbnailUrl
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      queryClient.invalidateQueries({ queryKey: ['coursesByCreator', data.creator.toString()] });
    },
  });
}

export function useEnrollInCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { enrollmentId: string; courseId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.enrollInCourse(params.enrollmentId, params.courseId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userEnrollments', data.user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['course', data.courseId] });
      queryClient.invalidateQueries({ queryKey: ['isEnrolled', data.user.toString(), data.courseId] });
    },
  });
}

export function useGetUserEnrollments(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Enrollment[]>({
    queryKey: ['userEnrollments', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getUserEnrollments(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useIsUserEnrolled(user: Principal | null, courseId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isEnrolled', user?.toString(), courseId],
    queryFn: async () => {
      if (!actor || !user || !courseId) return false;
      return actor.isUserEnrolled(user, courseId);
    },
    enabled: !!actor && !actorFetching && !!user && !!courseId,
  });
}
