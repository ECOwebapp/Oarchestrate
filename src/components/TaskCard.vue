<script setup vapor>

const props = defineProps(['name', 'description', 'urgent', 'progress', 'due'])

</script>

<template>
    <div class="relative flex flex-col rounded-2xl h-30 w-100 xl:w-120 py-2 px-4 overflow-hidden bg-white shadow-md hover:shadow-lg"
        :class="props.urgent === true ? 'outline-3 outline-red-900 text-red-900 shadow-red-900/90 hover:shadow-red-900/70' :
            'outline-2 outline-green-950 text-green-950 shadow-green-950/90 hover:shadow-green-950/70'">

        <!-- Ribbon -->
        <div v-if="props.urgent === true" class="absolute top-0 right-0 h-16 w-16">
            <div class="absolute transform rotate-45 bg-red-800 text-white text-1xl 
                    font-bold py-1 w-40 bottom-4 -right-12 text-center shadow-sm
                    uppercase">
                Urgent
            </div>
        </div>

        <p class="truncate uppercase font-bold mb-2 ">{{ name }}</p>
        <p class="line-clamp-2 italic text-sm">{{ description }}</p>
        <div class="flex flex-row items-center justify-evenly mt-3 gap-1">
            <div class="w-70 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div class="h-full transition-all duration-500 ease-out"
                    :class="props.urgent === true ? 'bg-red-800' : 'bg-green-950'"
                    :style="{ width: props.progress + '%' }">
                </div>
            </div>
            <div>
                <p class="text-xs font-bold italic">
                    {{ props.due >= 0 ? 'Due' : 'Overdue' }}:
                    {{ props.due < 0 ? props.due * -1 : props.due !== 0 ? props.due : 'Today' }} {{ props.due > 1 ||
                        props.due * -1 > 1 ? 'days' : 'day' }} </p>
            </div>
        </div>
    </div>
</template>