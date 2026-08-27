export interface DirectoryEntry {
  id: string;
  title: string;
  url: string;
  description: string;
  target?: string;
  tags?: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  entries: DirectoryEntry[];
}

export interface DirectoryData {
  version: string;
  title: string;
  subtitle: string;
  motd: string;
  systemName: string;
  defaultTheme: 'green' | 'amber' | 'cyan' | 'white' | 'matrix';
  scanlines: boolean;
  audio: boolean;
  showCategoryNumbers?: boolean;
  showEntryNumbers?: boolean;
  customTags?: string[];
  categories: Category[];
  updatedAt: string;
}

export const defaultDirectoryData: DirectoryData = {
  version: "1.0.0",
  title: "ASCII DIRECTORY // GATEWAY SYSTEM",
  subtitle: "PROXMOX HOMELAB NODE • CLOUDFLARE SECURE ROUTE",
  motd: "SYSTEM READY. SELECT AN ENTRY WITH ARROW KEYS OR CLICK DIRECTLY. TYPE 'help' FOR COMMANDS.",
  systemName: "RETRO-GW-01",
  defaultTheme: "green",
  scanlines: true,
  audio: true,
  showCategoryNumbers: true,
  showEntryNumbers: true,
  customTags: [
    "infra", "vm", "lxc", "backup", "storage", "network", 
    "security", "dns", "adblock", "streaming", "movies", 
    "tv", "opensource", "automation", "pvr", "git", 
    "code", "cicd", "cloud", "docs", "docker", "containers", 
    "monitoring", "telemetry"
  ],
  updatedAt: new Date().toISOString(),
  categories: [
    {
      id: "cat_homelab",
      name: "HOMELAB & INFRASTRUCTURE",
      icon: "[SYS]",
      order: 1,
      entries: [
        {
          id: "ent_pve",
          title: "Proxmox VE",
          url: "https://pve.local:8006",
          description: "Primary Hypervisor Cluster Node",
          target: "_blank",
          order: 1,
          tags: ["infra", "vm", "lxc"]
        },
        {
          id: "ent_pbs",
          title: "Proxmox Backup Server",
          url: "https://pbs.local:8007",
          description: "Deduplicated VM/CT Backups",
          target: "_blank",
          order: 2,
          tags: ["backup", "storage"]
        },
        {
          id: "ent_opnsense",
          title: "OPNsense Firewall",
          url: "https://router.local",
          description: "Core Gateway & WireGuard VPN",
          target: "_blank",
          order: 3,
          tags: ["network", "security", "dns"]
        },
        {
          id: "ent_pihole",
          title: "Pi-hole DNS Sinkhole",
          url: "http://pihole.local/admin",
          description: "Network-wide Ad & Tracker Blocker",
          target: "_blank",
          order: 4,
          tags: ["dns", "adblock"]
        }
      ]
    },
    {
      id: "cat_media",
      name: "MEDIA & ENTERTAINMENT",
      icon: "[MEDIA]",
      order: 2,
      entries: [
        {
          id: "ent_plex",
          title: "Plex Media Server",
          url: "https://app.plex.tv",
          description: "Movie & TV Show Streaming",
          target: "_blank",
          order: 1,
          tags: ["streaming", "movies", "tv"]
        },
        {
          id: "ent_jellyfin",
          title: "Jellyfin Server",
          url: "http://jellyfin.local:8096",
          description: "Open Source Media System",
          target: "_blank",
          order: 2,
          tags: ["streaming", "opensource"]
        },
        {
          id: "ent_sonarr",
          title: "Sonarr TV Manager",
          url: "http://sonarr.local:8989",
          description: "Automated TV Series Tracker",
          target: "_blank",
          order: 3,
          tags: ["automation", "pvr"]
        },
        {
          id: "ent_radarr",
          title: "Radarr Movie Manager",
          url: "http://radarr.local:7878",
          description: "Automated Movie Collection Tracker",
          target: "_blank",
          order: 4,
          tags: ["automation", "movies"]
        }
      ]
    },
    {
      id: "cat_devtools",
      name: "DEV TOOLS & STORAGE",
      icon: "[DEV]",
      order: 3,
      entries: [
        {
          id: "ent_gitea",
          title: "Gitea Git Service",
          url: "http://git.local:3000",
          description: "Self-hosted Code Version Control",
          target: "_blank",
          order: 1,
          tags: ["git", "code", "cicd"]
        },
        {
          id: "ent_nextcloud",
          title: "Nextcloud Hub",
          url: "https://cloud.local",
          description: "Private File Sync & Productivity Suite",
          target: "_blank",
          order: 2,
          tags: ["cloud", "storage", "docs"]
        },
        {
          id: "ent_portainer",
          title: "Portainer CE",
          url: "https://portainer.local:9443",
          description: "Container & Stack Management GUI",
          target: "_blank",
          order: 3,
          tags: ["docker", "containers"]
        },
        {
          id: "ent_grafana",
          title: "Grafana Dashboards",
          url: "http://grafana.local:3000",
          description: "Cluster Metrics & Node Telemetry",
          target: "_blank",
          order: 4,
          tags: ["monitoring", "telemetry"]
        }
      ]
    }
  ]
};
