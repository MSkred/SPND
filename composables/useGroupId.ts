export const useGroupId = () => {

  const route = useRoute()
  const groupId = ref(route.query.group)

  watch(() => route.query.group, () => {
    groupId.value = route.query.group
  });
  
  return groupId
}