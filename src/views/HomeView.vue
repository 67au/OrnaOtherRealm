<script setup lang="ts">
import AppLocaleSwitch from '@/components/AppLocaleSwitch.vue'
import realm from '@/assets/realm.json'
import { i18n, type Locale } from '@/i18n'
import {
  mdiCheckOutline,
  mdiChevronDoubleDown,
  mdiChevronDoubleUp,
  mdiClose,
  mdiDownloadBoxOutline,
  mdiRestore,
} from '@mdi/js'
import { useRealmState } from '@/stores/realm'
import { toPng } from 'html-to-image'

const raids = computed(() =>
  Object.entries(realm).map(([id, value]) => {
    return {
      id: id,
      hp: value.hp,
      tier: value.tier,
      icon: value.icon,
      name: value.name[i18n.global.locale.value as Locale],
    }
  }),
)

const realmState = useRealmState()
const isEditing = shallowRef(true)
const isLoading = shallowRef(false)
const captureArea = useTemplateRef('captureArea')
const dataURL: Ref<string | null> = ref(null)
const realmTitle = computed(() => realmState.title ?? i18n.global.t('title'))

async function capture() {
  if (captureArea.value !== null) {
    isLoading.value = true
    captureArea.value.$el.style.display = 'block'
    await new Promise((resolve) => setTimeout(resolve, 1500))
    dataURL.value = await toPng(captureArea.value.$el)
    captureArea.value.$el.style.display = 'none'
    isLoading.value = false
  }
}

function donwloadImage() {
  if (dataURL.value) {
    const link = document.createElement('a')
    link.href = dataURL.value
    link.download = 'realm.png'
    link.click()
  }
}
</script>

<template>
  <v-app>
    <v-app-bar :elevation="2" color="primary">
      <v-app-bar-title>{{ $t('title') }}</v-app-bar-title>
      <template v-slot:append>
        <div class="d-flex ga-1">
          <slot name="tools"></slot>
          <AppLocaleSwitch></AppLocaleSwitch>
        </div>
      </template>
    </v-app-bar>

    <v-main class="pb-16">
      <v-container max-width="600" class="px-4 mx-auto d-flex flex-column ga-2">
        <v-card color="surface-light">
          <v-list-item class="px-2" density="compact">
            <v-autocomplete
              hide-details
              single-line
              :label="$t('raids')"
              variant="solo"
              color="secondary"
              density="compact"
              :items="raids"
              item-title="name"
              item-value="id"
              v-model="realmState.list"
              class="py-1"
              clearable
              multiple
              clear-on-select
              hide-selected
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :text="item.title">
                  <template v-slot:prepend>
                    <v-avatar :rounded="false">
                      <v-img :src="item.raw.icon" class="image-render-pixel"></v-img>
                    </v-avatar>
                  </template>
                  <v-list-item-subtitle class="d-flex ga-1">
                    <v-chip
                      size="x-small"
                      color="warning"
                      rounded="sm"
                      :text="`★${item.raw.tier}`"
                    ></v-chip>
                    <v-chip
                      size="x-small"
                      color="error"
                      rounded="sm"
                      :text="`❤ ${item.raw.hp.toLocaleString()}`"
                    ></v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
              <template v-slot:chip="{ props, item }">
                <v-chip v-bind="props" :text="item.title" rounded="md" closable>
                  <template v-if="item.raw.icon !== undefined" v-slot:prepend>
                    <v-avatar :rounded="false" class="mr-1">
                      <v-img :src="item.raw.icon" class="image-render-pixel"></v-img>
                    </v-avatar>
                  </template>
                </v-chip>
              </template>
            </v-autocomplete>

            <v-text-field
              density="compact"
              clearable
              variant="solo"
              hide-details
              class="py-1"
              single-line
              v-model="realmState.title"
              :placeholder="$t('title')"
            >
              <template v-slot:append>
                <div class="pb-1 d-flex ga-1">
                  <v-dialog
                    close-on-back
                    opacity="0.2"
                    transition="fade-transition"
                    scrollable
                    :max-width="636"
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn
                        variant="text"
                        color="success"
                        :icon="mdiCheckOutline"
                        v-bind="props"
                        @click="capture"
                      ></v-btn>
                    </template>
                    <template v-slot="{ isActive }">
                      <v-card rounded="md">
                        <v-toolbar density="compact">
                          <v-toolbar-title>
                            {{ $t('preview') }}
                          </v-toolbar-title>
                          <template v-slot:append>
                            <v-btn
                              variant="text"
                              color="default"
                              :icon="mdiDownloadBoxOutline"
                              @click="donwloadImage"
                            ></v-btn>
                            <v-btn
                              :icon="mdiClose"
                              variant="text"
                              @click="isActive.value = false"
                            ></v-btn>
                          </template>
                        </v-toolbar>
                        <v-card-text class="pa-1">
                          <template v-if="isLoading">
                            <div class="py-2 text-center">
                              <v-progress-circular indeterminate></v-progress-circular>
                            </div>
                          </template>
                          <template v-else>
                            <v-img v-if="dataURL" :src="dataURL"></v-img>
                          </template>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                  <v-divider vertical class="my-1"></v-divider>
                  <v-btn
                    variant="text"
                    color="error"
                    :icon="mdiRestore"
                    @click="realmState.$reset()"
                  ></v-btn>
                </div>
              </template>
            </v-text-field>
          </v-list-item>
        </v-card>

        <v-card v-if="realmState.length > 0" border="md">
          <template v-for="(id, index) in realmState.list" :key="id">
            <v-divider></v-divider>
            <v-list-item class="py-2">
              <v-list-item-title>
                {{ realm[id]['name'][i18n.global.locale.value as Locale] }}
              </v-list-item-title>
              <v-list-item-subtitle class="pt-1 d-flex ga-1">
                <v-chip
                  size="small"
                  color="warning"
                  rounded="sm"
                  :text="`★${realm[id]['tier']}`"
                ></v-chip>
                <v-chip
                  size="small"
                  color="error"
                  rounded="sm"
                  :text="`❤ ${(realm[id]['hp'] * 10).toLocaleString()}`"
                ></v-chip>
              </v-list-item-subtitle>
              <template v-slot:prepend>
                <v-avatar :rounded="false" size="48">
                  <v-img :src="realm[id]['icon']" class="image-render-pixel"></v-img>
                </v-avatar>
              </template>
              <template v-slot:append v-if="isEditing">
                <div class="d-flex ga-1">
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="secondary"
                    :icon="mdiChevronDoubleUp"
                    @click="realmState.leftShift(index)"
                    :disabled="index === 0"
                    :ripple="false"
                  ></v-btn>
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="secondary"
                    :icon="mdiChevronDoubleDown"
                    @click="realmState.leftShift(index + 1)"
                    :disabled="index === realmState.length - 1"
                    :ripple="false"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
          </template>
        </v-card>
      </v-container>
    </v-main>
  </v-app>

  <v-sheet style="display: none" ref="captureArea" width="636">
    <v-list-item density="compact" class="py-2">
      <v-list-item-title class="text-h6 text-center">
        {{ realmTitle }}
      </v-list-item-title>
    </v-list-item>
    <v-sheet class="mx-4" border="md" rounded="lg">
      <template v-for="(id, index) in realmState.list" :key="id">
        <v-divider
          v-if="index !== 0"
          color="surface-light"
          thickness="2"
          class="border-opacity-75"
        ></v-divider>
        <v-list-item class="px-2">
          <v-list-item-title class="text-h6">
            {{ realm[id]['name'][i18n.global.locale.value as Locale] }}
          </v-list-item-title>
          <template v-slot:prepend>
            <v-avatar :rounded="false" size="48">
              <v-img
                :transition="false"
                :src="realm[id]['icon']"
                class="image-render-pixel"
                eager
              ></v-img>
            </v-avatar>
          </template>
          <template v-slot:append>
            <div style="width: 184px" class="d-flex justify-space-between">
              <v-chip
                color="warning"
                variant="text"
                rounded="sm"
                :text="`★${realm[id]['tier']}`"
              ></v-chip>
              <v-chip
                variant="text"
                color="error"
                rounded="sm"
                :text="`❤ ${(realm[id]['hp'] * 10).toLocaleString()}`"
              ></v-chip>
            </div>
          </template>
        </v-list-item>
      </template>
    </v-sheet>
    <v-footer>
      {{ new Date().toLocaleDateString() }}
      <v-spacer></v-spacer>
      {{ 'Powered by https://realm.fqegg.top' }}
    </v-footer>
  </v-sheet>
</template>

<style>
.image-render-pixel {
  -ms-interpolation-mode: nearest-neighbor;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-pixelated;
  image-rendering: pixelated;
}
</style>
