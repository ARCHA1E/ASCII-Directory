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
  defaultTheme: 'green' | 'amber' | 'cyan' | 'white';
  scanlines: boolean;
  audio: boolean;
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
          id: "ent_truenas",
          title: "TrueNAS Scale",
          url: "https://truenas.local",
          description: "ZFS Storage Pool & NFS/SMB Shares",
          target: "_blank",
          order: 2,
          tags: ["storage", "backup"]
        },
        {
          id: "ent_pihole",
          title: "Pi-hole DNS",
          url: "http://pihole.local/admin",
          description: "Network Ad-Blocker & Local DNS Gateway",
          target: "_blank",
          order: 3,
          tags: ["dns", "security"]
        },
        {
          id: "ent_portainer",
          title: "Portainer CE",
          url: "https://portainer.local:9443",
          description: "Docker Container Management Dashboard",
          target: "_blank",
          order: 4,
          tags: ["docker", "mgmt"]
        }
      ]
    },
    {
      id: "cat_media",
      name: "MEDIA & ENTERTAINMENT",
      icon: "[MED]",
      order: 2,
      entries: [
        {
          id: "ent_jellyfin",
          title: "Jellyfin Media",
          url: "https://jellyfin.local:8096",
          description: "Self-Hosted Streaming Movie/TV Server",
          target: "_blank",
          order: 1,
          tags: ["media", "streaming"]
        },
        {
          id: "ent_plex",
          title: "Plex Server",
          url: "https://app.plex.tv",
          description: "Personal Media Cloud Gateway",
          target: "_blank",
          order: 2,
          tags: ["media", "video"]
        },
        {
          id: "ent_audiobooks",
          title: "Audiobookshelf",
          url: "https://audiobooks.local",
          description: "Self-Hosted Audiobook & Podcast Server",
          target: "_blank",
          order: 3,
          tags: ["audio", "books"]
        }
      ]
    },
    {
      id: "cat_dev",
      name: "DEV & CLOUD SERVICES",
      icon: "[DEV]",
      order: 3,
      entries: [
        {
          id: "ent_github",
          title: "GitHub",
          url: "https://github.com",
          description: "Code Repositories & CI/CD Actions",
          target: "_blank",
          order: 1,
          tags: ["git", "dev"]
        },
        {
          id: "ent_cloudflare",
          title: "Cloudflare Zero Trust",
          url: "https://dash.cloudflare.com",
          description: "Tunnels, DNS & Edge Security Dashboard",
          target: "_blank",
          order: 2,
          tags: ["network", "cloud"]
        },
        {
          id: "ent_grafana",
          title: "Grafana & Prometheus",
          url: "http://grafana.local:3000",
          description: "Infrastructure Metrics & Alert Monitoring",
          target: "_blank",
          order: 3,
          tags: ["metrics", "monitoring"]
        }
      ]
    },
    {
      id: "cat_bookmarks",
      name: "QUICK LINKS & NETWORK",
      icon: "[NET]",
      order: 4,
      entries: [
        {
          id: "ent_hn",
          title: "Hacker News",
          url: "https://news.ycombinator.com",
          description: "Technology News & Discussions",
          target: "_blank",
          order: 1,
          tags: ["news", "tech"]
        },
        {
          id: "ent_archive",
          title: "Internet Archive",
          url: "https://archive.org",
          description: "Wayback Machine & Digital Library",
          target: "_blank",
          order: 2,
          tags: ["history", "web"]
        },
        {
          id: "ent_tailscale",
          title: "Tailscale Admin",
          url: "https://login.tailscale.com/admin",
          description: "Mesh VPN Mesh Network Control",
          target: "_blank",
          order: 3,
          tags: ["vpn", "network"]
        }
      ]
    }
  ]
};
