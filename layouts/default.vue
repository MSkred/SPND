<script setup lang="ts">
const route = useRoute()
const appConfig = useAppConfig()
const { isHelpSlideoverOpen } = useDashboard()

const links = [ {
  id: 'inbox',
  label: 'Liste des dépenses',
  icon: 'i-heroicons-list-bullet-20-solid',
  to: '/expense',
  // badge: '4',
  tooltip: {
    text: 'Liste',
    shortcuts: ['G', 'I']
  }
}, {
    id: 'home',
    label: 'Tableaux',
    icon: 'i-heroicons-table-cells-20-solid',
    to: '/board',
    tooltip: {
      text: 'Tableaux',
      shortcuts: ['G', 'H']
    }
  },{
    id: 'inbox',
    label: 'Catégories',
  icon: 'i-heroicons-rectangle-stack-20-solid',
    to: '/category',
    // badge: '4',
    tooltip: {
      text: 'Catégories',
      shortcuts: ['G', 'I']
    }
  }, {
    id: 'inbox',
    label: 'Tags',
    icon: 'i-heroicons-tag-20-solid',
    to: '/tag',
    // badge: '4',
    tooltip: {
      text: 'Tags',
      shortcuts: ['G', 'I']
    }
  }, {
  id: 'settings',
  label: 'Paramètres',
  to: '/settings',
  icon: 'i-heroicons-cog-8-tooth',
  children: [{
    label: 'Général',
    to: '/',
    exact: true
  }, {
    label: 'Membre',
    to: '/'
  }],
  tooltip: {
    text: 'Paramètres',
    shortcuts: ['G', 'S']
  }
}]

const footerLinks = [{
  label: 'Inviter un utilisateur',
  icon: 'i-heroicons-plus',
  to: '/'
}]

const groups = [{
  key: 'links',
  label: 'Go to',
  commands: links.map(link => ({ ...link, shortcuts: link.tooltip?.shortcuts }))
}, {
  key: 'code',
  label: 'Code',
  commands: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    click: () => {
      window.open(`https://github.com/nuxt-ui-pro/dashboard/blob/main/pages${route.path === '/' ? '/index' : route.path}.vue`, '_blank')
    }
  }]
}]

</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="250" :resizable="{ min: 200, max: 300 }" collapsible>
      <UDashboardNavbar class="!border-transparent" :ui="{ left: 'flex-1' }">
        <template #left>
          <TeamsDropdown />
        </template>
      </UDashboardNavbar>

      <UDashboardSidebar>
        <template #header>
          <UDashboardSearchButton />
        </template>

        <UDashboardSidebarLinks :links="links" />

        <div class="flex-1" />

        <UDashboardSidebarLinks :links="footerLinks" />

        <UDivider class="sticky bottom-0" />

        <template #footer>
          <!-- ~/components/UserDropdown.vue -->
          <UserDropdown />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <!-- ~/components/HelpSlideover.vue -->
    <!-- <HelpSlideover /> -->
    <!-- ~/components/NotificationsSlideover.vue -->
    <!-- <NotificationsSlideover /> -->

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>
  </UDashboardLayout>
</template>