import { ChannelMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { PieceContext } from '@sapphire/pieces';
import type { Guild, GuildChannel } from 'discord.js';
import { Argument, ArgumentContext, ArgumentResult } from '../lib/structures/Argument';

export class CoreArgument extends Argument<GuildChannel> {
	public constructor(context: PieceContext) {
		super(context, { name: 'guildChannel' });
	}

	public run(argument: string, context: ArgumentContext): ArgumentResult<GuildChannel> {
		const { guild } = context.message;
		if (!guild) {
			return this.error(argument, 'ArgumentGuildChannelMissingGuild', 'The argument must be run in a guild.');
		}

		const channel = this.resolveByID(argument, guild) ?? this.resolveByQuery(argument, guild);
		return channel
			? this.ok(channel)
			: this.error(argument, 'ArgumentGuildChannelUnknownChannel', 'The argument did not resolve to a guild channel.');
	}

	private resolveByID(argument: string, guild: Guild): GuildChannel | null {
		const channelID = ChannelMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
		return channelID ? guild.channels.cache.get(channelID[1]) ?? null : null;
	}

	private resolveByQuery(argument: string, guild: Guild): GuildChannel | null {
		const lowerCaseArgument = argument.toLowerCase();
		return guild.channels.cache.find((channel) => channel.name.toLowerCase() === lowerCaseArgument) ?? null;
	}
}
