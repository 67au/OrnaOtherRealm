export const useRealmState = defineStore(
  'realm',
  () => {
    const list = ref([])
    const title: Ref<string | null> = ref(null)

    const length = computed(() => list.value.length)

    function leftShift(index: number) {
      if (index <= 0 || index >= length.value) {
        return
      }
      ;[list.value[index - 1], list.value[index]] = [list.value[index], list.value[index - 1]]
    }

    function $reset() {
      list.value = []
      title.value = null
    }

    return {
      list,
      title,
      length,
      leftShift,
      $reset,
    }
  },
  {
    persistedState: {
      persist: true,
    },
  },
)
